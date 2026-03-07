# Campus Voice (Data-Driven Hackathon MVP)

## 1) Improved concept

Campus Voice is a **student civic intelligence dashboard** that turns official UK public issues into clear issue cards students can understand, vote on, and discuss.

Instead of only posting opinions, students explore evidence-backed public issues (transport, environment, education, housing), prioritise them, and generate a **Youth Mandate Brief** for decision-makers.

## 2) Why this is stronger than the old version

Old version:
- mostly manual issue posting
- useful mainly for already-engaged users
- weaker evidence context

New version:
- real-style public issue feed
- source/evidence context + credibility score
- student priority voting and trend charts
- student vs official priority gap views
- one-click policy brief to make youth voice actionable

## 3) How the Grokathon inspiration is adapted

Inspired by data-driven civic accountability tools, this MVP adapts the concept for youth voice:
- not politician fact-checking,
- but **student-facing issue translation + priority intelligence**.

It focuses on:
- trusted public-data style inputs,
- youth-readable summaries,
- measurable participation,
- outputs adults can act on.

## 4) MVP scope

- Landing + mission
- Real-Issue Explorer (sample UK-style public data)
- Area/category/sort filters
- Issue detail with source, evidence, actions, comments
- Priority voting (high/medium/low)
- Dashboard scorecards and charts
- Youth Mandate Brief output
- Cambridge River Cam pollution demo issue

## 5) Architecture and stack

### Current hackathon implementation
- HTML + CSS + Vanilla JS
- LocalStorage persistence
- Canvas chart rendering

### Recommended upgrade path
- Next.js + TypeScript + Tailwind
- Supabase (auth + Postgres + row-level security)
- API routes for ingesting/normalising public datasets
- Chart library (e.g. Recharts)

## 6) UK public data source model (for integration)

Potential sources:
- data.gov.uk datasets
- UK Parliament committees/petitions feeds
- council consultations and committee agendas
- local air quality, transport, planning, housing datasets
- ONS/official statistics where relevant

Suggested ingestion model:
1. Fetch raw source data.
2. Normalize into common issue schema.
3. Add summary, category, confidence/credibility metadata.
4. Expose to frontend as unified issue feed.

## 7) Logical database schema

- `users(id, name, education_level, created_at)`
- `issues(id, title, location, category, chamber, source, credibility_score, official_priority, why_it_matters, created_at)`
- `issue_evidence(id, issue_id, evidence_text)`
- `issue_actions(id, issue_id, action_text)`
- `votes(id, issue_id, user_id, priority_level, created_at)`
- `comments(id, issue_id, user_id, body, created_at)`
- `brief_runs(id, user_id, content, created_at)`

## 8) Main pages and user flow

1. Home dashboard: mission, filters, issue cards, scorecards/charts.
2. Issue detail: evidence, source, actions, youth discussion, vote.
3. Return to dashboard and see updated charts/stats.
4. Generate Youth Mandate Brief.

## 9) Stats and charts

- Total student votes
- Most voted issue this week
- Credibility average
- "You are not alone" metric
- Chart 1: student high-priority votes by issue
- Chart 2: student-vs-official priority gap by issue

## 10) File structure

```text
.
├── index.html
├── styles.css
├── app.js
└── README.md
```

## Run locally

```bash
python3 -m http.server 4173
```

Open: <http://127.0.0.1:4173/index.html>
