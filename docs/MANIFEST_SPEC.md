# Open License Manifest Specification v0.1

The Open License Manifest is a public JSON document that lets humans, software agents, and AI systems discover what rights are available for a song without entering a private app.

The manifest is intentionally static-site friendly. A creator can publish `/catalog/index.json` and one `/catalog/<song-id>.manifest.json` file per song from a simple build step.

## Goals

- Make allowed uses, blocked uses, prices, and checkout links machine-readable.
- Make AI consent and AI refusal equally explicit.
- Disclose collaborator split percentages without exposing private payout details.
- Allow other tools to implement the same schema without permission from this app.

## Public Files

`/catalog/index.json` lists all published manifests.

`/catalog/<song-id>.manifest.json` describes one song and its license options.

## Manifest Object

Required fields:

- `schemaVersion`: string. Must be `"0.1"` for this version.
- `id`: stable URL-safe song identifier.
- `title`: song title.
- `artist`: artist, band, label, or project name.
- `isrc`: optional ISRC or catalog identifier. Empty string is allowed when unknown.
- `ownership`: object containing public rights-owner labels.
- `aiPolicy`: machine-readable AI policy.
- `blockedUses`: array of use descriptions the creator does not permit.
- `scopes`: array of purchasable or blocked license scopes.
- `splits`: array of collaborator split disclosures for this song. Each song manifest must resolve to splits totaling exactly 100%.
- `generatedAt`: ISO timestamp for the generated file.

Optional fields:

- `manifestUrl`: public URL path where this manifest is expected to live.
- `sourceCatalogVersion`: version of the source catalog schema.

## Field Definitions

`ownership`:

- `masterOwner`: public owner label for the master recording.
- `compositionOwner`: public owner label for the composition.

`aiPolicy` allowed values:

- `opt-in-priced`: AI training or generation may be licensed through listed scopes.
- `manual-approval`: AI use requires manual approval before purchase.
- `no-training`: AI training and generation are not permitted.

`scopes[]`:

- `scope`: stable slug for the license category.
- `label`: human-readable license label.
- `price`: numeric listed price.
- `currency`: three-letter currency code, usually `USD`.
- `checkoutUrl`: public checkout URL. Empty string is allowed for manual approval or blocked scopes.
- `status`: `available`, `manual-approval`, or `blocked`.

Recommended v0.1 scope slugs:

- `podcast-video-sync`
- `indie-game-app-loop`
- `local-business-fitness-event`
- `brand-campaign-sync`
- `remix-stem-use`
- `ai-training`
- `ai-generation-soundtrack`
- `ai-exclusion`
- `short-form-creator`

`splits[]`:

- `id`: stable collaborator identifier.
- `role`: public contribution label.
- `percent`: percentage of sale proceeds assigned to that role.

`data/catalog.json` source files may define optional `defaultSplits`, but generated public manifests must always contain resolved per-song `splits[]`. Songs with featured artists, remix collaborators, or alternate ownership should override the default at `songs[].splits`.

Do not put emails, bank information, Stripe account IDs, Wise IDs, addresses, tax IDs, private legal names, or private payment instructions in a public manifest. Because `data/catalog.json` may be committed to a public repository, use stage names, company names, role labels, or other professional public labels there too.

## Example

```json
{
  "schemaVersion": "0.1",
  "id": "midnight-signal",
  "title": "Midnight Signal",
  "artist": "Nova Wells",
  "isrc": "QZ-ABC-26-00123",
  "manifestUrl": "/catalog/midnight-signal.manifest.json",
  "ownership": {
    "masterOwner": "Nova Wells LLC",
    "compositionOwner": "Nova Wells Publishing"
  },
  "aiPolicy": "opt-in-priced",
  "blockedUses": ["political ads", "hate content"],
  "scopes": [
    {
      "scope": "short-form-creator",
      "label": "Short-form creator sync",
      "price": 350,
      "currency": "USD",
      "checkoutUrl": "https://buy.stripe.com/example",
      "status": "available"
    }
  ],
  "splits": [
    {
      "id": "lead-artist",
      "role": "Composition and master",
      "percent": 65
    }
  ],
  "sourceCatalogVersion": "0.1",
  "generatedAt": "2026-07-24T09:34:16.000Z"
}
```

## Legal Notice

Generated license receipts and manifest terms are structured operational records, not lawyer-drafted contracts. Creators should review terms with qualified counsel before relying on them for commercial legal enforcement.
