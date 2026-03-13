import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DATA_FILE = resolve(ROOT, "data", "disposable_domains.txt");
const DOMAINS_TS = resolve(ROOT, "src", "domains.ts");

const UPSTREAM_URL =
  "https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/master/disposable_email_blocklist.conf";

const MIN_DOMAIN_COUNT = 100;

function sha256(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

async function main(): Promise<void> {
  // 1. Fetch upstream domain list
  console.log("Fetching upstream domain list…");
  const response = await fetch(UPSTREAM_URL);
  if (!response.ok) {
    console.error(`Fetch failed: ${response.status} ${response.statusText}`);
    process.exit(1);
  }
  const raw = await response.text();

  // 2. Clean: split, trim, lowercase, filter, dedupe, sort
  const domains = [
    ...new Set(
      raw
        .split("\n")
        .map((line) => line.trim().toLowerCase())
        .filter((line) => line.length > 0 && !line.startsWith("#"))
    ),
  ].sort();

  console.log(`Fetched ${domains.length} domains`);

  if (domains.length < MIN_DOMAIN_COUNT) {
    console.error(
      `Domain count (${domains.length}) is below minimum (${MIN_DOMAIN_COUNT}) — aborting`
    );
    process.exit(1);
  }

  // 3. Compare SHA-256 hashes
  const newContent = domains.join("\n") + "\n";
  const newHash = sha256(newContent);

  if (existsSync(DATA_FILE)) {
    const existingContent = readFileSync(DATA_FILE, "utf-8");
    const existingHash = sha256(existingContent);
    if (newHash === existingHash) {
      console.log("No changes detected — domain list is up to date.");
      return;
    }
  }

  // 4. Write data file
  writeFileSync(DATA_FILE, newContent, "utf-8");
  console.log(`Wrote ${DATA_FILE}`);

  // 5. Generate src/domains.ts
  const entries = domains.map((d) => `  "${d}",`).join("\n");
  const generated = `// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY
export const DISPOSABLE_DOMAINS: ReadonlySet<string> = new Set<string>([
${entries}
]);
`;
  writeFileSync(DOMAINS_TS, generated, "utf-8");
  console.log(`Generated ${DOMAINS_TS} with ${domains.length} domains`);
}

main();
