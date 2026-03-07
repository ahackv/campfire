# CivicSpark (Hackathon MVP)

## 1) Current codebase analysis (before this update)

The project already had:
- issue cards and student voting
- issue detail page
- civic stats dashboard elements
- a multi-round city simulation game with random events
- sample public-issue data and local persistence

Main weaknesses observed:
- too many features visible at once (high cognitive load)
- weak first-impression hook despite rich functionality
- game value not visually front-and-center

## 2) Cleaner UI structure applied

Homepage now follows a simplified, high-impact flow:
1. Hero + strong question/hook
2. Featured civic issue (personalized framing)
3. Game entry (“Future of Your City”)
4. 60-second civic stories
5. Student vs official priority insights

## 3) New additions in this iteration

### Animated background system
- Added subtle ambient gradient + floating particles.
- Lightweight CSS animation with readability preserved.
- Supports dark/light mode via `prefers-color-scheme`.

### 60 Second Civic Stories
- Added shorts-style vertical video cards.
- Uses placeholder videos now (easy swap to API-generated content later).
- Auto-refresh cycle logic on hourly cadence + countdown timer.

### Game improvements (existing game kept and expanded)
- Stronger visual feedback using stat delta indicators per action.
- Clear immediate consequences in game feedback.
- Multiple ending summaries + shareable result card.

### Student vs officials comparison
- Added clean side-by-side comparison bars for each issue.
- Shows relative student vs official priority intensity.

### More personal issue cards
Each card now clearly answers:
- what the issue is,
- why it matters to students,
- what happens if nothing changes,
- what students want.

## 4) Performance and UX notes

- Video elements use `preload="metadata"` and `loading="lazy"`.
- Background animation kept subtle and low-cost.
- Layout remains responsive for mobile.
- Core functionality preserved (issue voting, details, simulation flow, persistence).

## Run

```bash
python3 -m http.server 4173
```

Open: <http://127.0.0.1:4173/index.html>
