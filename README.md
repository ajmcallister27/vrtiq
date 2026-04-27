# vrtIQ

vrtIQ is a ski and snowboard intelligence platform that helps riders find accurate run difficulty, monitor lift status, and compare resort conditions before they head up the mountain.

## Why vrtIQ is different

- Real user-reported and system-tracked mountain signals
- Difficulty ratings that better reflect how runs actually ski
- Lift-focused updates to reduce wait surprises
- Cross-resort comparison workflows for better trip decisions

## Visibility-first positioning

Use these phrases consistently across your website, social profiles, and listings:

- ski run difficulty app
- lift wait time tracker
- resort condition intelligence
- ski planning app
- ski and snowboard conditions tracker
- compare ski resorts by real difficulty

Primary one-liner:

"vrtIQ is the ski app for real run difficulty, live lift intel, and smarter resort decisions."

## Core discovery channels

1. Search engine visibility (SEO)

- Rich metadata in `index.html` (title, description, Open Graph, Twitter)
- Structured data with `WebSite` and `SoftwareApplication` JSON-LD
- Crawl directives and sitemap in `public/robots.txt` and `public/sitemap.xml`

2. App-store style visibility (ASO for PWA and app directories)

- PWA manifest metadata optimized in `vite.config.js`
- Category and shortcut entries that improve install-card context
- Consistent listing copy for product directories and marketplaces

3. AI answer engine visibility (AEO / LLM discoverability)

- `public/llms.txt` added for machine-readable product summary
- Intent-focused FAQ content in `public/ai-overview.md`
- Structured facts and keywords written in answer-friendly format

## Fast launch checklist

1. Submit `https://vrtiq.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
2. Verify `https://vrtiq.com/robots.txt` and `https://vrtiq.com/llms.txt` are reachable.
3. Add consistent directory listings using the same app title + description.
4. Request indexing for homepage and key entry URLs after each major update.
5. Publish one weekly changelog post with keywords tied to resort condition updates.

## Build and run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Admin bulk import from skiresort.info

Use the Add Data page to import a full resort dataset in one step:

1. Open `Add Data`.
2. Go to the `Bulk` tab.
3. Paste a `skiresort.info` resort URL.
4. Submit the import.

The importer will:

- scrape resort metadata (name, location, elevations, coordinates when available)
- scrape lifts and upsert them into the resort
- scrape runs and difficulty, then upsert runs
- analyze trail map assets with OCR to improve run matching where possible

Notes:

- Import requires an authenticated admin user.
- Trail-map OCR is best-effort because source map quality varies.

## Current priorities

- filter by condition per day
- add "last updated" timestamp to resorts
- push to app stores
- make it fast and responsive
- add resort icons

## Known issue

- error creating runs
