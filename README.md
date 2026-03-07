# Campus Voice (Hackathon MVP)

A youth civic engagement app that combines a **practical issue-posting platform** with an **interactive democracy game**.

## 1) Product concept

Campus Voice has two experiences:

1. **Community platform (passive-to-active tools)**
   - students post local issues, discuss, vote, and generate action outputs.
2. **Your Town, Your Choices (interactive simulation game)**
   - students play short local scenarios and see consequences on civic metrics.

This helps both already-engaged users and users who feel bored/ignored by democracy.

## 2) Why this is better than the original website-only version

- Website-only flow helps students who already care.
- The game adds a hook for disengaged users by making decisions feel personal, visual, and immediate.
- It shows that inaction and misinformation also have consequences.
- It teaches that collective, evidence-based action is stronger than isolated frustration.

## 3) MVP features

### Platform features
- demo student account
- local issues feed
- issue detail discussion screen
- votes + comments
- submit issue form
- action generator (council email + petition summary)
- light gamification (points/streak/badge)

### Game features
- 4 branching scenarios (including Cambridge River Cam pollution)
- visible stats bars:
  - Youth Voice
  - Public Trust
  - Community Wellbeing
  - Environment
  - Misinformation Risk
- choice-by-choice feedback
- final ending + reflection

## 4) Scenario list

1. River Cam boat smoke pollution (Cambridge)
2. Student bus fare increase
3. Neglected local park
4. Library hours for exam season

## 5) User flow

1. User lands on home and sees old-vs-new comparison.
2. User can either:
   - post/discuss issues, or
   - start the game.
3. In game mode, user completes rounds and sees stat changes.
4. User gets ending + lesson and can replay.

## 6) Recommended stack

- **Current MVP:** HTML + CSS + Vanilla JS + LocalStorage.
- **Upgrade path:** Next.js + Supabase or React + Firebase.

## 7) Logical database schema (for full-stack upgrade)

- `users(id, name, level, points, streak, badges)`
- `issues(id, title, location, why, created_by, created_at)`
- `votes(id, issue_id, user_id, type)`
- `comments(id, issue_id, user_id, body, created_at)`
- `game_runs(id, user_id, started_at, ended_at, ending_label)`
- `game_choices(id, game_run_id, scenario_key, choice_key, effects_json)`

## 8) Folder structure

```text
.
├── index.html      # Landing, issue workflow, and game screens
├── styles.css      # UI styles + game bars/cards
├── app.js          # App state, issue tools, and game engine
└── README.md
```

## Run locally

```bash
python3 -m http.server 4173
```

Open <http://127.0.0.1:4173/index.html>
