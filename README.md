# 14-0 — Original Mode and T20 Mode (2026 format)

Open `index.html` to choose a mode.

- **Original Mode** (`original.html`): unchanged 14-match Championship challenge.
- **T20 Mode** (`t20.html`): 2026 men's Vitality Blast competition structure: three fixed regional groups of six, 12 group games per county (10 home-and-away within the group, two cross-group matches), eight quarter-finalists (top two from each group and two best third-placed), quarter-finals, semi-finals and final. Group standings use points and approximate net run rate calculated from simulated innings.

The schedule is generated to satisfy the 2026 competition format; it does **not** reproduce the actual dated 2026 fixture list or exact knockout bracket/seeding rules.

T20 Mode now uses a new save key (`cdc-t20-2026-v2`) to avoid loading incompatible older seasons. Original Mode saves are unaffected.

Use **Change mode** to return to the selection screen.

## T20 2026 player database
T20 Mode loads `t20-data.js`, while Original Mode continues to load `data.js`. The 2026 T20 season-wide squads were curated from Wisden’s 21 May 2026 squad list and ECB team previews. Ratings are subjective T20-specific gameplay estimates on the existing BAT/BWL scale, **not** official ratings or validated statistical projections. The game does not yet implement overseas player availability windows or international call-ups. A new T20 save key avoids incompatibility with older player IDs.

## T20 2026 player database
T20 Mode loads `t20-data.js`, while Original Mode continues to load `data.js`. The 2026 T20 season-wide squads were curated from Wisden’s 21 May 2026 squad list and ECB team previews. Ratings are subjective T20-specific gameplay estimates on the existing BAT/BWL scale, **not** official ratings or validated statistical projections. The game does not yet implement overseas player availability windows or international call-ups. A new T20 save key avoids incompatibility with older player IDs.

## Mobile support
All three pages now load `mobile.css`, which adds responsive layout, touch-friendly controls, horizontal scrolling for detailed scorecards and league tables, and small-screen adjustments. Gameplay and saved data are unchanged.
