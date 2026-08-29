#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const EN_JSON = path.join(ROOT, "translations", "en.json");
const SRC_DIR = path.join(ROOT, "src");

function flattenKeys(obj, prefix = "") {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object" && v !== null) {
      keys.push(...flattenKeys(v, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

const translations = JSON.parse(fs.readFileSync(EN_JSON, "utf8"));
const allKeys = flattenKeys(translations);

// Grab all source code in one shot
const srcFiles = execSync(
  `find ${SRC_DIR} -type f \\( -name "*.tsx" -o -name "*.ts" \\)`,
  { encoding: "utf8" }
)
  .trim()
  .split("\n");

const allSource = srcFiles.map((f) => fs.readFileSync(f, "utf8")).join("\n");

const unused = [];
const used = [];

for (const key of allKeys) {
  // Match t("key") or t('key') — also handles dynamic suffixes like key + ".sub"
  if (allSource.includes(`"${key}"`) || allSource.includes(`'${key}'`)) {
    used.push(key);
  } else {
    unused.push(key);
  }
}

console.log(`\nTotal keys: ${allKeys.length}`);
console.log(`Used: ${used.length}`);
console.log(`Unused: ${unused.length}\n`);

if (unused.length > 0) {
  console.log("── Unused keys ──────────────────────────────────");
  unused.forEach((k) => console.log(`  ${k}`));
}
