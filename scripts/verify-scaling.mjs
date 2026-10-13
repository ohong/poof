import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
process.loadEnvFile(".env.local");
const base = process.env.POOF_BASE_URL || "http://localhost:3101";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (
  !["localhost", "127.0.0.1"].includes(new URL(base).hostname) ||
  !["localhost", "127.0.0.1"].includes(new URL(url).hostname)
)
  throw Error("Scaling QA only runs against the disposable local stack.");
const db = createClient(url, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const email = `poof-scaling-${crypto.randomUUID()}@example.test`;
const password = crypto.randomUUID() + "Aa1!";
const created = await db.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});
if (created.error) throw created.error;
const user = created.data.user.id;
const cookies = new Map();
const client = createServerClient(
  url,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  {
    cookies: {
      getAll: () => [...cookies].map(([name, value]) => ({ name, value })),
      setAll: (values) =>
        values.forEach(({ name, value }) => cookies.set(name, value)),
    },
  },
);
try {
  const login = await client.auth.signInWithPassword({ email, password });
  if (login.error) throw login.error;
  const rows = Array.from({ length: 1000 }, (_, index) => {
    const id = crypto.randomUUID();
    return {
      id,
      user_id: user,
      original_path: `${user}/${id}/original.jpg`,
      name: `Scaling fixture ${index}`,
      description: "d".repeat(1200),
      notes: "n".repeat(2000),
      listing_body: "b".repeat(4000),
      processing_state: "ready",
    };
  });
  for (let offset = 0; offset < rows.length; offset += 100) {
    const result = await db
      .from("items")
      .insert(rows.slice(offset, offset + 100));
    if (result.error) throw result.error;
  }
  const headers = {
    Cookie: [...cookies].map(([name, value]) => `${name}=${value}`).join("; "),
  };
  const response = await fetch(base + "/api/items?offset=900", { headers });
  assert.equal(response.status, 200);
  const body = await response.text();
  const data = JSON.parse(body);
  assert.equal(data.total, 1000);
  assert.equal(data.items.length, 1000);
  // Model a conservative 2,048-byte pair of signed URLs per entry, since fixture media is absent.
  const withUrls = JSON.stringify({
    ...data,
    items: data.items.map((item) => ({
      ...item,
      image_url: "x".repeat(1024),
      original_url: "x".repeat(1024),
    })),
  });
  assert.ok(
    Buffer.byteLength(withUrls) < 4_500_000,
    "Worst-case list response must stay below the host response limit",
  );
  assert.equal(
    "listing_body" in data.items[0],
    false,
    "Long sale drafts belong in the detail response",
  );
  const detail = await fetch(base + `/api/items/${rows[0].id}`, { headers });
  assert.equal(detail.status, 200);
  assert.equal((await detail.json()).item.listing_body.length, 4000);
  console.log(
    `PASS: 1,000-record inventory with maximum-length notes and drafts; modeled list payload ${Buffer.byteLength(withUrls)} bytes. Media was not seeded; signed URL sizes were conservatively modeled.`,
  );
} finally {
  await db.auth.admin.deleteUser(user);
}
