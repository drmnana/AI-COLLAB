import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const required = ["index.html", "styles.css", "app.js"];

for (const file of required) {
  if (!existsSync(path.join(root, file))) {
    throw new Error(`Missing required file: ${file}`);
  }
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const file of required) {
  await cp(path.join(root, file), path.join(dist, file));
}

console.log("Built static site in dist/");
