import { randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const status = JSON.parse(
  execFileSync("supabase", ["status", "--output", "json"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }),
);
const previous = existsSync(".env.local")
  ? readFileSync(".env.local", "utf8")
  : "";
const site =
  previous
    .split("\n")
    .find((line) => line.startsWith("NEXT_PUBLIC_SITE_URL=")) ||
  "NEXT_PUBLIC_SITE_URL=http://localhost:3000";
const providers = previous
  .split("\n")
  .filter((line) =>
    /^(BFL_API_KEY|ANTHROPIC_API_KEY|BFL_MODEL|ANTHROPIC_MODEL|CRON_SECRET|DAILY_USER_AI_LIMIT|DAILY_GLOBAL_AI_LIMIT|MAX_INVENTORY_ITEMS)=/.test(
      line,
    ),
  );
writeFileSync(
  ".env.local",
  [
    `NEXT_PUBLIC_SUPABASE_URL=${status.API_URL}`,
    `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${status.PUBLISHABLE_KEY || status.ANON_KEY}`,
    `SUPABASE_SECRET_KEY=${status.SECRET_KEY || status.SERVICE_ROLE_KEY}`,
    site,
    ...providers,
    ...(providers.some((line) => line.startsWith("CRON_SECRET="))
      ? []
      : [`CRON_SECRET=${randomBytes(32).toString("hex")}`]),
    "",
  ].join("\n"),
  { mode: 0o600 },
);
console.log(
  "Wrote local Supabase configuration to ignored .env.local. Provider keys were preserved when present.",
);
