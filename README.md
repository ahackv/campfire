# Campus Voice (Ultra Hackathon MVP)

## What already existed (baseline)

The project already had:
- issue explorer cards
- student voting
- scorecards/charts
- civic simulation game
- issue detail experience
- basic public-issue style dataset

## Extensions added in this iteration

This update **extends** the existing platform (without removing baseline features) by adding:

1. **Politics Humor Hub**
   - 3 civic/political memes-jokes with funniest-vote interactions
   - auto refresh cycle with hourly countdown logic

2. **Future of Your City Simulator**
   - projects city outcomes (pollution, transport, green investment, budget pressure)
   - computed from current student voting patterns

3. **Priority Comparison Engine**
   - table comparing student priority rank vs official priority rank
   - includes visible gap column

4. **AI Debate Mode (Issue detail)**
   - two-agent debate snippets (economic vs environmental)
   - student vote on debate side

5. **Advanced game continuity**
   - keeps existing game and expands round outcomes with random events,
   - visible stat shifts,
   - multiple endings

6. **Civic leaderboard + rank system**
   - ranks: Observer, Voter, Community Voice, Policy Influencer, Youth Leader
   - leaderboard blends sample users + current participant points

7. **Interactive issue map via Leaflet**
   - real map rendering with markers for issue locations
   - click marker to open issue detail

## Run

```bash
python3 -m http.server 4173
```

Open: <http://127.0.0.1:4173/index.html>
