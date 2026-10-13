import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
process.loadEnvFile(".env.local");
const base = process.env.POOF_BASE_URL || "http://localhost:3101";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (
  !["localhost", "127.0.0.1"].includes(new URL(base).hostname) ||
  !["localhost", "127.0.0.1"].includes(new URL(url).hostname)
)
  throw Error("Maintenance QA only runs on the disposable local stack.");
const db = createClient(url, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data, error } = await db.auth.admin.createUser({
  email: `poof-maintenance-${crypto.randomUUID()}@example.test`,
  password: crypto.randomUUID() + "Aa1!",
  email_confirm: true,
});
if (error) throw error;
const user = data.user.id;
const id = crypto.randomUUID();
const known = `${user}/${id}/original.jpg`;
const orphan = `${user}/${crypto.randomUUID()}/catalog.jpg`;
const folder = mkdtempSync(join(tmpdir(), "poof-maintenance-"));
try {
  const inserted = await db
    .from("items")
    .insert({ id, user_id: user, original_path: known });
  if (inserted.error) throw inserted.error;
  const interrupted = await db
    .from("items")
    .update({
      processing_state: "processing",
      attempts: 1,
      updated_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    })
    .eq("id", id);
  if (interrupted.error) throw interrupted.error;
  const image = readFileSync("public/samples/mug-catalog.jpg");
  for (const path of [known, orphan]) {
    const result = await db.storage
      .from("object-images")
      .upload(path, image, { contentType: "image/jpeg" });
    if (result.error) throw result.error;
  }
  // Simulate elapsed time; use the real database, API, authorization, and storage.
  const sql = join(folder, "age.sql");
  writeFileSync(
    sql,
    `update storage.objects set created_at=now()-interval '7 days' where bucket_id='object-images' and name in ('${known}','${orphan}');`,
  );
  execFileSync("supabase", ["db", "query", "--local", "--file", sql], {
    stdio: "pipe",
  });
  const unauthorized = await fetch(base + "/api/maintenance");
  assert.equal(unauthorized.status, 401);
  const response = await fetch(base + "/api/maintenance", {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.ok(result.removed >= 1);
  assert.ok(
    (await db.storage.from("object-images").download(orphan)).error,
    "Expired orphan must be removed",
  );
  assert.ok(
    !(await db.storage.from("object-images").download(known)).error,
    "A referenced old photo must survive",
  );
  const recovered = await db
    .from("items")
    .select("processing_state,warning")
    .eq("id", id)
    .single();
  assert.equal(recovered.data.processing_state, "failed");
  assert.match(recovered.data.warning, /retry/);
  console.log(
    "PASS: maintenance authorization, orphan cleanup, referenced-photo retention, and interrupted-start recovery. Age and interrupted state were simulated; API and storage were real.",
  );
} finally {
  await db.storage.from("object-images").remove([known, orphan]);
  await db.auth.admin.deleteUser(user);
  rmSync(folder, { recursive: true, force: true });
}
