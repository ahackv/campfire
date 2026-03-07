# CivicSpark (Hackathon MVP)

## 1) Analysis of existing project

Before this update, CivicSpark already had:
- issue discovery and voting,
- issue detail pages,
- a playable civic simulation,
- local persistence,
- basic comparison and visual polish.

### Weaknesses found
- too many parallel elements competing for attention,
- weak first-10-second hook,
- placeholder civic story section not convincing,
- limited live public-data feel.

## 2) Simplified UI structure applied

Homepage flow now:
1. Hero question/hook
2. Featured issue card
3. Main game entry
4. Civic Explained in 60 Seconds (whiteboard)
5. Student vs official comparison
6. Full issue cards below

## 3) Government issue data integration

Added live ingestion from UK Parliament Petitions API (with fallback to existing curated issues):
- fetches open petitions,
- classifies into civic categories,
- generates student-friendly summaries,
- merges into existing issue feed.

## 4) Whiteboard civic explainer system

Replaced generic placeholders with a whiteboard animation module:
- script auto-generated from real/top issues,
- text written onto canvas progressively,
- hourly refresh cycle,
- calm background music track in-section.

## 5) Game redesign improvements

Kept existing game and upgraded:
- clearer city metrics,
- random events,
- branching decisions,
- visible stat delta feedback,
- shareable ending card.

## 6) Student vs government comparison

Added clean comparison bars for each issue:
- student priority intensity,
- official priority intensity,
- clear at-a-glance mismatch signal.

## 7) Issue card improvements

Each card now explicitly answers:
- what is happening,
- why it matters to students,
- what happens if ignored,
- what actions students want.

## 8) Performance and UX guardrails

- lightweight CSS background animation,
- canvas explainer animation (no heavy video pipeline required for MVP),
- hourly refresh cadence,
- responsive layout maintained.

## Run

```bash
python3 -m http.server 4173
```

Open: <http://127.0.0.1:4173/index.html>
