# Campus Voice (Ultra Hackathon MVP)

## Product summary

Campus Voice is a **student civic intelligence ecosystem** that combines:
- real-style UK public issue exploration,
- youth voting and evidence views,
- AI-style explainers,
- meme/joke engagement loops,
- an interactive issue map,
- and a replayable **Fix Your City** strategy simulation.

## Why this version is stronger

Compared with a basic issue-posting site, this version adds:
- entertainment hooks (hourly memes + fun voting),
- gamification and civic ranks,
- dynamic simulation with random events and multiple endings,
- visual dashboards and student-vs-official priority gaps,
- decision-ready output via a one-click Youth Mandate Brief.

## MVP feature set implemented

1. **Real-Issue Explorer**
   - UK-style government/council issues with source, category, chamber, credibility, and votes.
2. **Issue Detail + Misinformation Trust Meter**
   - evidence list, actions, discussion highlights, trust bar, and priority voting.
3. **Political Meme & Joke Hub**
   - 3 refreshed memes (hourly timer) and “vote funniest” interaction.
4. **Youth Dashboard**
   - scorecards + charts for top concerns and student-vs-official priority gap.
5. **Interactive Issue Map**
   - area hotspots that open top local issue quickly.
6. **Fix Your City Game**
   - 5 rounds, random events, multi-metric management, and multiple endings.
7. **Gamification**
   - civic XP and ranks: Observer → Voter → Community Voice → Policy Influencer → Youth Leader.
8. **Youth Mandate Brief**
   - generates judge/adult-friendly recommendation summary.

## Key sample issue included

- Cambridge River Cam boat emissions and air quality issue with evidence and actions.

## Suggested next upgrade (post-hackathon)

- Next.js + TypeScript + Tailwind
- Supabase/Firebase auth + DB
- API route layer for data.gov.uk / council feeds
- LLM integration for richer explainers and misinformation classification
- map library (Leaflet/Mapbox)

## Run

```bash
python3 -m http.server 4173
```

Open: <http://127.0.0.1:4173/index.html>
