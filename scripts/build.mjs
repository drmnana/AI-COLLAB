import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const catalogSource = path.join(root, "data", "catalog.json");
const required = ["index.html", "styles.css", "app.js"];
const aiPolicies = new Set(["opt-in-priced", "manual-approval", "no-training"]);
const scopeStatuses = new Set(["available", "manual-approval", "blocked"]);

for (const file of required) {
  if (!existsSync(path.join(root, file))) {
    throw new Error(`Missing required file: ${file}`);
  }
}

if (!existsSync(catalogSource)) {
  throw new Error("Missing required file: data/catalog.json");
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const file of required) {
  await cp(path.join(root, file), path.join(dist, file));
}

const catalog = JSON.parse(await readFile(catalogSource, "utf8"));
validateCatalog(catalog);
await writeCatalogManifests(catalog);

console.log("Built static site in dist/");

function validateCatalog(catalog) {
  if (catalog.schemaVersion !== "0.1") {
    throw new Error("data/catalog.json must use schemaVersion 0.1");
  }
  if (!Array.isArray(catalog.songs) || catalog.songs.length === 0) {
    throw new Error("data/catalog.json must include songs[]");
  }
  if (catalog.defaultSplits !== undefined) {
    validateSplits(catalog.defaultSplits, "defaultSplits");
  }
  for (const song of catalog.songs) {
    for (const field of ["id", "title", "artist", "masterOwner", "compositionOwner", "aiPolicy"]) {
      if (!song[field]) throw new Error(`song is missing ${field}`);
    }
    if (!aiPolicies.has(song.aiPolicy)) {
      throw new Error(`${song.id} has invalid aiPolicy: ${song.aiPolicy}`);
    }
    if (!Array.isArray(song.scopes) || song.scopes.length === 0) {
      throw new Error(`${song.id} must include scopes[]`);
    }
    for (const scope of song.scopes) {
      if (!scopeStatuses.has(scope.status)) {
        throw new Error(`${song.id} has invalid scope status: ${scope.status}`);
      }
    }
    resolveSongSplits(catalog, song);
  }
}

function validateSplits(splits, label) {
  if (!Array.isArray(splits) || splits.length === 0) {
    throw new Error(`${label} must include at least one split`);
  }
  const splitTotal = splits.reduce((sum, split) => sum + Number(split.percent || 0), 0);
  if (splitTotal !== 100) {
    throw new Error(`${label} must total 100%, received ${splitTotal}%`);
  }
}

function resolveSongSplits(catalog, song) {
  const splits = Array.isArray(song.splits) && song.splits.length > 0
    ? song.splits
    : catalog.defaultSplits;
  validateSplits(splits, `${song.id} splits`);
  return splits;
}

async function writeCatalogManifests(catalog) {
  const catalogDir = path.join(dist, "catalog");
  const generatedAt = new Date().toISOString();
  await mkdir(catalogDir, { recursive: true });

  const index = {
    schemaVersion: catalog.schemaVersion,
    generatedAt,
    manifests: catalog.songs.map((song) => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      manifestUrl: `/catalog/${song.id}.manifest.json`,
      aiPolicy: song.aiPolicy,
      scopeCount: song.scopes.length
    }))
  };

  await writeJson(path.join(catalogDir, "index.json"), index);

  for (const song of catalog.songs) {
    await writeJson(path.join(catalogDir, `${song.id}.manifest.json`), {
      schemaVersion: "0.1",
      id: song.id,
      title: song.title,
      artist: song.artist,
      isrc: song.isrc || "",
      manifestUrl: `/catalog/${song.id}.manifest.json`,
      ownership: {
        masterOwner: song.masterOwner,
        compositionOwner: song.compositionOwner
      },
      aiPolicy: song.aiPolicy,
      blockedUses: Array.isArray(song.blockedUses) ? song.blockedUses : [],
      scopes: song.scopes.map((scope) => ({
        scope: scope.scope,
        label: scope.label,
        price: Number(scope.price || 0),
        currency: scope.currency || "USD",
        checkoutUrl: scope.checkoutUrl || "",
        status: scope.status || "manual-approval"
      })),
      splits: resolveSongSplits(catalog, song).map((split) => ({
        id: split.id,
        role: split.role,
        percent: Number(split.percent)
      })),
      sourceCatalogVersion: catalog.schemaVersion,
      generatedAt
    });
  }
}

async function writeJson(filePath, payload) {
  await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`);
}
