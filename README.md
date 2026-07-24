# Music Monetization: Open License Manifest + Creator Revenue Router

Music Monetization is a creator-first rights and revenue system for replacing platform-heavy streaming economics with a more balanced revenue stack.

The invention is the **Open License Manifest + Creator Revenue Router**:

- The Open License Manifest publishes song rights as static, machine-readable JSON.
- The Creator Revenue Router turns those rights into checkout links, receipts, payout instructions, and fan conversion data.
- Streaming platforms remain discovery channels; the creator-owned router manages monetization.

The MVP focuses on a practical model:

- direct fan memberships
- paid fan missions and drops
- transparent collaborator splits
- micro-licenses for AI, creators, games, podcasts, gyms, events, and brands
- cooperative treasury rules that keep more profit with artists

## Run Locally

```powershell
npm run build
npm start
```

Then open the local URL printed by the server.

## Deploy Proof

This repo includes `.github/workflows/deploy.yml`, which builds `dist/` and deploys it to GitHub Pages on every push to `main`.

If Pages is not already enabled, set repo Settings -> Pages -> Source to `GitHub Actions`.

## Product Concept

The app helps a creator or small label publish rights, sell scoped licenses, generate private receipts, export payout instructions, and see which discovery channels convert. It includes:

- revenue simulator
- song rights registry
- public Open License Manifest generation
- checkout-link editor for license products
- downloadable structured license receipts
- payout instruction exports
- fan conversion tracking
- split ledger
- campaign builder
- exportable JSON plan

The app is static and dependency-free, so it can be deployed to GitHub Pages, Netlify, Cloudflare Pages, Vercel static output, or any basic web host.

## End-To-End Workflow

1. Add songs to the rights registry with public ownership labels, identifiers, AI policy, blocked uses, and split percentages.
2. Edit license products with prices, status, and Stripe Payment Links or manual approval links.
3. Export `catalog.json`, commit it to `data/catalog.json`, and rebuild.
4. The build publishes `/catalog/index.json` and `/catalog/<song-id>.manifest.json` for humans, crawlers, licensing tools, or AI agents.
5. Generate private receipt JSON when a license is sold or recorded.
6. Export payout JSON/CSV instructions from the receipt. Payout math uses cent-accurate largest-remainder allocation and refuses exports when split totals are not exactly 100%.
7. Use the conversion tracker to see whether Spotify bio links, TikTok, YouTube, email, live-show QR codes, Bandcamp, or direct URLs create buyer demand.

## Open License Manifest

The build reads `data/catalog.json` and publishes:

- `dist/catalog/index.json`
- `dist/catalog/<song-id>.manifest.json`

These files are the public machine-readable rights layer. A human, search crawler, AI agent, music supervisor, or licensing tool can fetch them without using the dashboard UI.

The dashboard can export an updated `catalog.json`. In the static v1 workflow, a creator edits the registry, exports the catalog source, commits it to `data/catalog.json`, and rebuilds to publish fresh manifests.

See `docs/MANIFEST_SPEC.md` for schema v0.1.

## License Receipts

The receipt generator creates structured JSON records for a selected song and license scope. Receipts include buyer, intended use, territory, source channel, song ownership, AI policy, blocked uses, price, checkout URL, and split percentages.

Receipts are private operational records, not legal advice or lawyer-drafted contracts. Do not commit receipts containing buyer names or email addresses to a public repository.

## Payout Exports

Payout exports turn a receipt or gross amount into JSON or CSV payout instructions. Exports are blocked unless the resolved receipt splits total exactly 100%.

The exported payout file is an instruction record for accounting, Stripe Connect transfers, Wise batch payments, or manual payout processing. It does not move money by itself.

Payout allocation uses integer cents with largest-remainder distribution so collaborator amounts always add up exactly to the net amount after platform fee.

## Simulator Honesty

The simulator separates DSP streaming gross from router-managed revenue. Router fees apply only to direct memberships, licenses, and drops, not to DSP streaming gross. Uplift is shown as router net compared with DSP gross, and effort assumptions are surfaced for memberships and license workload.
