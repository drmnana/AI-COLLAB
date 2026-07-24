# Music Monetization

Music Monetization is a creator-first planning dashboard for replacing platform-heavy streaming economics with a more balanced revenue stack.

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

## Product Concept

The app helps a creator or small label compare legacy streaming revenue against a diversified model. It includes:

- revenue simulator
- song rights registry
- public Open License Manifest generation
- split ledger
- campaign builder
- exportable JSON plan

The app is static and dependency-free, so it can be deployed to GitHub Pages, Netlify, Cloudflare Pages, Vercel static output, or any basic web host.

## Open License Manifest

The build reads `data/catalog.json` and publishes:

- `dist/catalog/index.json`
- `dist/catalog/<song-id>.manifest.json`

These files are the public machine-readable rights layer. A human, search crawler, AI agent, music supervisor, or licensing tool can fetch them without using the dashboard UI.

The dashboard can export an updated `catalog.json`. In the static v1 workflow, a creator edits the registry, exports the catalog source, commits it to `data/catalog.json`, and rebuilds to publish fresh manifests.

See `docs/MANIFEST_SPEC.md` for schema v0.1.
