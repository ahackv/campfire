# Campus Voice (Hackathon MVP)

A demo-ready civic engagement platform for secondary school, A-level, and university students.

## Product summary

Campus Voice is a light social platform where students can learn civic basics, report local concerns, discuss solutions, vote on priorities, and generate action outputs (email + petition summaries) to help convert youth voice into real-world action.

## MVP scope

- Student account creation (local demo profile)
- Homepage feed of local/community issues
- Issue cards with voting counts
- Discussion area with comments
- New issue submission form
- "Why this matters" education panel in plain language
- Action hub to generate council email draft and petition summary
- Light gamification (points, streaks, badge)

## Sample content included

- Cambridge River Cam boat smoke pollution scenario preloaded in the issue feed.

## User flow

1. Student creates profile.
2. Student browses issue cards.
3. Student opens an issue, reads context, votes, and comments.
4. Student can submit new issue.
5. Student generates action output to share with council/community.
6. Student earns points and badges through participation.

## Recommended stack (for hackathon progression)

- **Current MVP (this repo):** HTML, CSS, Vanilla JS + LocalStorage.
- **Upgrade path:** Next.js + Supabase (Auth, Postgres, realtime comments) or React + Firebase.

## Database schema (logical)

- `users(id, name, level, points, streak, badges)`
- `issues(id, title, location, why, created_by, created_at)`
- `votes(id, issue_id, user_id, type)`
- `comments(id, issue_id, user_id, body, created_at)`

## Project structure

```text
.
├── index.html      # App layout and sections
├── styles.css      # Visual design
├── app.js          # MVP state, interactions, local storage
└── README.md
```

## Run locally

```bash
python3 -m http.server 4173
```

Open <http://127.0.0.1:4173/index.html>
