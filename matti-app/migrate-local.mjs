import { createClient } from "@libsql/client";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "dev.db");

console.log("DB path:", dbPath);

const db = createClient({ url: `file:${dbPath}` });

const steps = [
  {
    name: "Add taxId to Store",
    sql: `ALTER TABLE "Store" ADD COLUMN "taxId" TEXT`,
  },
  {
    name: "Create ApiKey table",
    sql: `CREATE TABLE IF NOT EXISTS "ApiKey" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "key" TEXT NOT NULL,
      "name" TEXT NOT NULL DEFAULT 'Standard-Schluessel',
      "storeId" TEXT NOT NULL,
      "active" INTEGER NOT NULL DEFAULT 1,
      "createdAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "lastUsedAt" TEXT,
      FOREIGN KEY ("storeId") REFERENCES "Store"("id")
    )`,
  },
  {
    name: "Create unique index on ApiKey.key",
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "ApiKey_key_key" ON "ApiKey"("key")`,
  },
];

for (const step of steps) {
  try {
    await db.execute(step.sql);
    console.log("✓", step.name);
  } catch (e) {
    if (e.message?.includes("duplicate column") || e.message?.includes("already exists")) {
      console.log("–", step.name, "(already done)");
    } else {
      console.error("✗", step.name, "→", e.message);
    }
  }
}

db.close();
console.log("\nFertig. Starte jetzt npm run dev neu.");
