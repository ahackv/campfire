# CivicSpark (Hackathon Demo)

## 1) Current codebase analysis

The project already had:
- issue discovery + voting
- a civic simulation game
- student-vs-official comparison concept
- modern animated styling

### Main weaknesses addressed
- too much scrolling and cognitive load
- weak immediate hook
- slow-feeling interaction flow

## 2) Simplified architecture and UI flow

The app is now focused on **4 core sections** with button navigation:

1. Swipe Decisions
2. Civic Simulation Game
3. Students vs Officials Live Stats
4. Real Government Issues Explorer

Navigation is click-based (no long scroll dependency).

## 3) Government issue pipeline

- Keeps base curated issues for reliability.
- Adds live ingestion from UK Parliament Petitions API.
- Normalizes incoming data into student-friendly issue cards.
- Auto-categorizes issues into environment / transport / housing / education.

## 4) Swipe Decisions (new main hook)

- Tinder-style decision cards with Yes/No actions.
- Instant feedback on student support vs official priority.
- Cards include 10-second relevance context.
- Updates live stats and issue priorities.

## 5) Students vs Officials live stats page

- Shows top student and official priorities.
- Highlights biggest disagreement.
- Visual bars update as users vote/swipe.

## 6) Game improvements

- Keeps 5-year simulation and random events.
- Clear stat deltas per decision.
- Multiple endings with shareable final result card.

## 7) Design polish

- subtle animated gradient background
- modern cards and transitions
- cleaner spacing and focused pages
- fast and mobile-friendly layout

## Run locally

```bash
python3 -m http.server 4173
```

Open: <http://127.0.0.1:4173/index.html>
