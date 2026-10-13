import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
process.loadEnvFile(".env.local");
const base = process.env.POOF_BASE_URL || "http://localhost:3101";
const database = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (
  !["localhost", "127.0.0.1"].includes(new URL(base).hostname) ||
  !["localhost", "127.0.0.1"].includes(new URL(database).hostname)
)
  throw Error(
    "This verifier only runs against a disposable local Supabase stack.",
  );
const admin = createClient(database, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const users = [];
async function account() {
  const email = `poof-qa-${crypto.randomUUID()}@example.test`;
  const password = crypto.randomUUID() + "Aa1!";
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  users.push(data.user.id);
  const cookies = new Map();
  const client = createServerClient(
    database,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => [...cookies].map(([name, value]) => ({ name, value })),
        setAll: (values) =>
          values.forEach(({ name, value }) => cookies.set(name, value)),
      },
    },
  );
  const signed = await client.auth.signInWithPassword({ email, password });
  if (signed.error) throw signed.error;
  return {
    id: data.user.id,
    client,
    headers: () => ({
      Cookie: [...cookies]
        .map(([name, value]) => `${name}=${value}`)
        .join("; "),
    }),
  };
}
async function request(user, path, method = "GET", body) {
  const response = await fetch(base + path, {
    method,
    headers: {
      ...user?.headers(),
      "Content-Type": "application/json",
      Origin: base,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, data: await response.json() };
}
const artifacts = process.env.POOF_EVIDENCE_DIR || "/tmp";
try {
  const alice = await account();
  const bob = await account();
  assert.equal((await request(null, "/api/items")).status, 401);
  const id = crypto.randomUUID();
  const photo = await sharp(readFileSync("public/samples/mug-original.png"))
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toBuffer();
  const created = await request(alice, "/api/items", "POST", {
    id,
    type: "image/jpeg",
    size: photo.length,
  });
  assert.equal(created.status, 200);
  const repeat = await request(alice, "/api/items", "POST", {
    id,
    type: "image/jpeg",
    size: photo.length,
  });
  assert.equal(repeat.status, 200);
  const uploaded = await alice.client.storage
    .from("object-images")
    .uploadToSignedUrl(created.data.path, created.data.token, photo, {
      contentType: "image/jpeg",
    });
  if (uploaded.error) throw uploaded.error;
  let inventory = await request(alice, "/api/items");
  assert.equal(inventory.data.total, 1);
  assert.equal(inventory.data.items[0].id, id);
  assert.equal(
    (await request(bob, `/api/items/${id}`, "PATCH", { name: "Stolen" }))
      .status,
    404,
  );
  assert.equal(
    (await request(bob, `/api/items/${id}/process`, "POST")).status,
    404,
  );
  const stolen = await bob.client.storage
    .from("object-images")
    .download(created.data.path);
  assert.ok(stolen.error);
  const anonymous = createClient(
    database,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  assert.ok(
    (await anonymous.storage.from("object-images").download(created.data.path))
      .error,
  );
  assert.equal(
    (await request(alice, `/api/items/${id}`, "PATCH", { user_id: bob.id }))
      .status,
    400,
  );
  assert.equal(
    (
      await request(alice, "/api/items", "POST", {
        id: crypto.randomUUID(),
        type: "text/html",
        size: 100,
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request(alice, "/api/items", "POST", {
        id: crypto.randomUUID(),
        type: "image/png",
        size: 11000000,
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request(alice, `/api/items/${id}`, "PATCH", {
        name: "Blue mug",
        listing_title: "Blue stoneware mug",
        listing_body: "One blue mug. Small chip on the rim.",
        asking_price: 8,
      })
    ).status,
    200,
  );
  const changedCurrency = await request(alice, `/api/items/${id}`, "PATCH", {
    currency: "GBP",
  });
  assert.equal(
    changedCurrency.data.item.asking_price,
    null,
    "Changing currency must not reinterpret an old asking price",
  );
  assert.equal(
    (await request(alice, `/api/items/${id}`, "PATCH", { disposition: "sell" }))
      .status,
    200,
  );
  assert.equal((await request(alice, "/api/items")).data.total, 0);
  assert.equal(
    (await request(alice, "/api/items?archive=1")).data.items[0].disposition,
    "sell",
  );
  assert.equal(
    (
      await request(alice, `/api/items/${id}`, "PATCH", {
        disposition: "active",
      })
    ).status,
    200,
  );
  assert.equal((await request(alice, "/api/items")).data.total, 1);
  assert.equal((await request(bob, "/api/items")).data.total, 0);
  const malicious = await fetch(base + `/api/items/${id}`, {
    method: "PATCH",
    headers: {
      ...alice.headers(),
      "Content-Type": "application/json",
      Origin: "https://example.invalid",
    },
    body: JSON.stringify({ name: "Cross-origin" }),
  });
  assert.equal(malicious.status, 403);
  assert.equal(
    (await request(alice, "/api/export")).data.items[0].name,
    "Blue mug",
  );
  assert.ok(
    (await alice.client.from("items").update({ name: "Bypass" }).eq("id", id))
      .error,
    "Browser must not bypass mutation endpoints",
  );
  assert.ok(
    (
      await alice.client.rpc("claim_processing", {
        item_id: id,
        owner_id: alice.id,
        user_limit: 500,
        global_limit: 500,
      })
    ).error,
    "Browser must not choose its own quota",
  );
  const invisible = await bob.client.from("items").select("id").eq("id", id);
  assert.equal(invisible.data.length, 0);
  assert.equal(
    (await request(bob, `/api/items/${id}`, "DELETE", { confirmation: id }))
      .status,
    404,
  );
  console.log(
    "PASS: real local auth, upload, persistence, idempotent allocation, edits, archive, undo, export, validation, origin checks, account and private-image isolation.",
  );
  if (process.argv.includes("--live-ai")) {
    // Restore the untouched fixture name so the live model must identify the object.
    await request(alice, `/api/items/${id}`, "PATCH", {
      name: "New object",
      listing_title: "",
      listing_body: "",
      description: "",
    });
    await admin.from("items").update({ details_edited: false }).eq("id", id);
    const began = performance.now();
    const started = await request(alice, `/api/items/${id}/process`, "POST");
    assert.equal(started.status, 202, JSON.stringify(started.data));
    const duplicate = await request(alice, `/api/items/${id}/process`, "POST");
    assert.equal(duplicate.status, 200);
    let item;
    for (let attempt = 0; attempt < 75; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 4000));
      inventory = await request(alice, "/api/items");
      item = (await request(alice, `/api/items/${id}`)).data.item;
      if (
        item.processing_state === "ready" ||
        item.processing_state === "failed"
      )
        break;
    }
    assert.equal(
      item.processing_state,
      "ready",
      JSON.stringify({ state: item.processing_state, warning: item.warning }),
    );
    assert.ok(item.description.length > 10, "Missing real description");
    assert.ok(
      item.price_low !== null &&
        item.price_high !== null &&
        item.price_high >= item.price_low,
      "A recognizable everyday fixture needs an ordered price range",
    );
    assert.ok(item.image_path, "Missing real image transformation");
    assert.match(
      item.name,
      /mug|cup/i,
      "Model did not identify the fixture primary object",
    );
    assert.match(
      item.description + " " + item.listing_body + " " + item.listing_title,
      /chip/i,
      "Visible chip must survive in the description or sale draft",
    );
    assert.doesNotMatch(
      item.description + " " + item.listing_body + " " + item.listing_title,
      /no chips|without chips|vintage|antique|handmade/i,
      "Draft must not deny the visible chip or invent provenance",
    );
    assert.equal(
      item.attempts,
      1,
      "Duplicate submission incurred another attempt",
    );
    const transformed = await alice.client.storage
      .from("object-images")
      .download(item.image_path);
    if (transformed.error) throw transformed.error;
    writeFileSync(
      artifacts + "/poof-mug-transformed.jpg",
      Buffer.from(await transformed.data.arrayBuffer()),
    );
    writeFileSync(
      artifacts + "/poof-live-result.json",
      JSON.stringify(
        {
          name: item.name,
          description: item.description,
          listing_title: item.listing_title,
          listing_body: item.listing_body,
          price_low: item.price_low,
          price_high: item.price_high,
          price_basis: item.price_basis,
          warning: item.warning,
          elapsed_seconds: (performance.now() - began) / 1000,
        },
        null,
        2,
      ),
    );
    console.log(
      "PASS: real BFL and Anthropic processing through the public API and durable workflow; original and transformed private images persisted. Elapsed seconds:",
      Math.round((performance.now() - began) / 1000),
    );
    const activeId = crypto.randomUUID();
    const allocated = await request(alice, "/api/items", "POST", {
      id: activeId,
      type: "image/jpeg",
      size: photo.length,
    });
    assert.equal(allocated.status, 200);
    const activeUpload = await alice.client.storage
      .from("object-images")
      .uploadToSignedUrl(allocated.data.path, allocated.data.token, photo, {
        contentType: "image/jpeg",
      });
    if (activeUpload.error) throw activeUpload.error;
    assert.equal(
      (await request(alice, `/api/items/${activeId}/process`, "POST")).status,
      202,
    );
    let active;
    for (let attempt = 0; attempt < 20; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      active = (
        await admin
          .from("items")
          .select("provider_job,processing_state")
          .eq("id", activeId)
          .single()
      ).data;
      if (active.provider_job) break;
    }
    assert.ok(
      active.provider_job,
      "The cancellation fixture must reach a real provider submission",
    );
    assert.equal(
      active.processing_state,
      "processing",
      "Removal must be exercised during processing",
    );
    assert.equal(
      (
        await request(alice, `/api/items/${activeId}`, "DELETE", {
          confirmation: activeId,
        })
      ).status,
      200,
    );
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const remnants = await admin.storage
      .from("object-images")
      .list(`${alice.id}/${activeId}`);
    assert.equal(
      remnants.data.length,
      0,
      "Stopped jobs must not leave media after removal",
    );
    assert.equal((await request(alice, `/api/items/${activeId}`)).status, 404);
    console.log(
      "PASS: removal during real AI processing cancels the durable run and leaves no stored media.",
    );
  }
  const quotaId = crypto.randomUUID();
  assert.equal(
    (
      await request(bob, "/api/items", "POST", {
        id: quotaId,
        type: "image/jpeg",
        size: 100,
      })
    ).status,
    200,
  );
  const claims = await Promise.all([
    admin.rpc("claim_processing", {
      item_id: quotaId,
      owner_id: bob.id,
      user_limit: 1,
      global_limit: 10000,
    }),
    admin.rpc("claim_processing", {
      item_id: quotaId,
      owner_id: bob.id,
      user_limit: 1,
      global_limit: 10000,
    }),
  ]);
  assert.equal(
    claims.filter((value) => value.data === true).length,
    1,
    "Concurrent claims must reserve once",
  );
  const nextId = crypto.randomUUID();
  await request(bob, "/api/items", "POST", {
    id: nextId,
    type: "image/jpeg",
    size: 100,
  });
  const limited = await admin.rpc("claim_processing", {
    item_id: nextId,
    owner_id: bob.id,
    user_limit: 1,
    global_limit: 10000,
  });
  assert.ok(limited.error?.message.includes("POOF_DAILY_LIMIT"));
  assert.equal(
    (
      await request(alice, `/api/items/${id}`, "DELETE", {
        confirmation: "wrong",
      })
    ).status,
    400,
  );
  assert.equal(
    (await request(alice, `/api/items/${id}`, "DELETE", { confirmation: id }))
      .status,
    200,
  );
  assert.equal((await request(alice, "/api/items")).data.total, 0);
  assert.ok(
    (
      await alice.client.storage
        .from("object-images")
        .download(created.data.path)
    ).error,
    "Deleted photo must not remain readable",
  );
  assert.equal(
    (await request(alice, "/api/account", "DELETE", { confirmation: "no" }))
      .status,
    400,
  );
  assert.equal(
    (await request(alice, "/api/account", "DELETE", { confirmation: "DELETE" }))
      .status,
    200,
  );
  assert.equal(
    (await request(alice, "/api/items")).status,
    401,
    "Deleted accounts must lose access",
  );
  console.log(
    "PASS: atomic quota claims, daily limit enforcement, object erasure, account erasure, and session invalidation.",
  );
} finally {
  for (const id of users) {
    const { data: items } = await admin
      .from("items")
      .select("original_path,image_path")
      .eq("user_id", id);
    const paths = (items || []).flatMap((item) =>
      [item.original_path, item.image_path].filter(Boolean),
    );
    if (paths.length) await admin.storage.from("object-images").remove(paths);
    await admin.auth.admin.deleteUser(id);
  }
}
