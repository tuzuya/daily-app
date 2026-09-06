import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

/* このリポジトリは `.env.local` を使っている（`.env` は存在しない）。
 * `import "dotenv/config"` だけだと `.env` を探して DATABASE_URL が
 * undefined になるため、明示的に読む。 */
config({ path: ".env.local" });
config({ path: ".env" });

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL が未設定です。.env.local に Neon の pooled 接続文字列を入れてください",
  );
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
