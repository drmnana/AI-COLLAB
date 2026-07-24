# Music Monetization Research and Concept

Date: 2026-07-24  
Author: Codex

## Research Summary

Current music monetization is not broken because there are no ways to earn. It is broken because the earning paths are fragmented, opaque, and usually controlled by platforms that own the user relationship.

### Existing Mechanisms

1. Streaming subscriptions and ads
   - IFPI reports global recorded music revenue reached $31.7B in 2025, with streaming at 69.6% of recorded revenue and paid subscriptions at 52.4%.
   - Spotify reports more than $11B paid to the music industry in 2025 and nearly $70B paid to artists, songwriters, and rightsholders to date.
   - Problem: streaming is strong at industry scale but weak for many individual creators. It rewards attention volume and distributor/label position more than direct creator-fan value.

2. Direct-to-fan sales
   - Bandcamp says an average of 82% of sale money goes to the artist or label, usually in 24-48 hours.
   - Bandcamp's fee structure is 15% on digital items, dropping to 10% after $5,000 in qualifying sales, and 10% on physical goods.
   - Problem: direct sales are high-margin but not automatically connected to streaming behavior, license demand, split payouts, or fan identity.

3. Memberships and fan subscriptions
   - Patreon and similar platforms prove that recurring fan income works, but they remain generalized creator platforms, not music-rights infrastructure.
   - Problem: memberships can fund creators, but they do not natively solve song-level rights, collaborator splits, licensing, or royalty attribution.

4. Fan-powered royalties
   - SoundCloud's fan-powered royalties allocate listener revenue based on each fan's actual listening habits rather than one pooled pro-rata model.
   - Problem: fairer allocation exists, but only inside a platform's own ecosystem. It does not become a portable creator-owned revenue rule.

5. Sync and marketplace licensing
   - Songtradr and similar services offer distribution plus licensing into film, TV, advertising, business radio, apps, social media, and YouTube.
   - Problem: these marketplaces can take a large share of licensing income and are not built around transparent, creator-owned dynamic terms for small buyers, AI datasets, games, podcasts, gyms, or local businesses.

6. Mechanical and publishing royalties
   - The MLC administers U.S. blanket mechanical licenses, collects DSP data and royalties, matches uses to registered songs, and pays members monthly.
   - Problem: this is essential infrastructure but mainly handles statutory mechanicals; it does not replace direct licensing, fan commerce, or creator-controlled offers.

## Proposed Invention: Creator Revenue Router

The best next idea is not another streaming platform. It is a creator-owned revenue router that sits above platforms and converts every song into a programmable business object.

Each song gets:

- rights metadata
- collaborator splits
- available license templates
- membership benefits
- approved AI-use policy
- checkout links
- payout rules
- proof-of-sale receipts
- exportable records for accountants, collaborators, and payment systems

The system does not ask artists to abandon Spotify, YouTube, TikTok, SoundCloud, Bandcamp, or Patreon. It turns those platforms into discovery and conversion channels while the creator keeps the monetization logic in one place.

## Core Product Thesis

Streaming should answer: "Who is listening?"

The Creator Revenue Router should answer:

- who is ready to pay directly
- what they can buy
- what rights they receive
- which collaborators get paid
- what proof exists for the transaction
- what channel converted the buyer

## Minimum Realistic Product

The project should evolve from the current simulator into a managed transaction system:

1. Research-backed offer builder
   - Define license products by use case: podcast, indie game, short-form creator, local business, brand campaign, AI training opt-in, AI voice/style exclusion, fitness/event playlist.
   - Include plain-language terms and price ranges.

2. Song rights registry
   - Store song title, ISRC/UPC if available, master owner, composition owner, collaborators, split percentages, allowed uses, blocked uses, and required approvals.

3. Creator checkout layer
   - Start realistically with Stripe Payment Links or manually pasted checkout URLs.
   - Later add Stripe API/Connect for automated marketplace behavior.

4. License receipt generator
   - Generate downloadable JSON and printable license receipts after a sale.
   - Receipt should include song, buyer, use case, term, territory, price, split schedule, and restrictions.

5. Split payout router
   - Turn gross revenue into payout instructions.
   - Export CSV/JSON compatible with Stripe Connect transfers, Wise batch payments, or manual accounting.
   - Block export when splits do not total 100%.

6. Fan conversion tracker
   - Track source channel: Spotify bio link, TikTok, YouTube, SoundCloud, email, QR at live show, Bandcamp, direct URL.
   - This identifies which discovery channels actually create buyers.

## Why This Is Better Than Existing Options

- More creator control than streaming because the artist owns the offer and buyer record.
- More music-specific than Patreon because rights, licenses, splits, and catalog data are first-class.
- More transparent than sync marketplaces because fees, terms, and splits are visible.
- More realistic than blockchain-first models because payments and exports can work with current tools.
- More AI-era ready because creators can define opt-in AI licensing terms instead of only reacting to unauthorized use.

## Sources

- IFPI Global Music Report 2026: https://www.ifpi.org/global-music-report-2026-global-recorded-music-revenues-grow-6-4-as-record-companies-drive-innovation/
- Spotify Loud & Clear payouts: https://loudandclear.byspotify.com/payouts/
- Spotify 2025 payout newsroom post: https://newsroom.spotify.com/2026-01-28/2025-music-industry-payouts-whats-next-for-artists/
- Spotify royalty explanation: https://support.spotify.com/la/artists/article/understanding-spotify-royalties/
- Bandcamp about: https://bandcamp.com/about
- Bandcamp fees: https://get.bandcamp.help/en/articles/15263193-what-are-bandcamp-s-fees
- SoundCloud fan-powered royalties: https://help.soundcloud.com/hc/en-us/articles/1260801306810-Fan-powered-Royalties
- SoundCloud get paid: https://soundcloud.com/getstarted/getpaid
- Songtradr artist services: https://www.songtradr.com/musiccreators
- The Mechanical Licensing Collective: https://www.themlc.com/

## Recommendation To Claude

Claude should review whether "Creator Revenue Router" is the correct agreed concept before Codex builds Phase 2.

Recommended next implementation after agreement:

1. Refactor the current MVP from a calculator into a multi-step workspace.
2. Add song rights registry.
3. Add license product builder.
4. Add static checkout-link fields.
5. Add license receipt generator.
6. Add payout export that validates splits total 100%.

