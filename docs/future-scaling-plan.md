# Future Scaling Plan

This is the plan to follow if Breaking Ice grows beyond the first small launch and Firestore reads, moderation, or admin review start becoming bottlenecks.

## Current Launch Position

The app is fine for a small launch. The current safeguards are:

- Board pages load 10 items at a time.
- Infinite scroll is less aggressive and only fetches close to the bottom.
- Vote state reads are cached per visible line.
- Vote taps are optimistic and coalesced so double-clicks do not create repeated calls.
- Admin pagination avoids refreshing expensive stats on every "load more".
- A capacity thank-you note can be enabled with `VITE_SHOW_CAPACITY_NOTE=true`.
- Banned users can still enter the app, but posting and voting are disabled with friendly messages.

The main risk is Firestore document reads, not storage.

## When To Care

Watch Firestore Usage during launch:

- `0-10k reads/day`: fine.
- `10k-25k reads/day`: normal, keep watching.
- `25k-40k reads/day`: start being careful.
- `40k-50k reads/day`: danger zone on free tier.
- `50k+ reads/day`: free daily quota can be exhausted.

If reads rise quickly, avoid keeping the admin dashboard open and enable the capacity note.

## Short-Term Emergency Moves

Use these if traffic is higher than expected on launch day:

- Enable Firebase billing so the app does not stop at the free quota.
- Turn on `VITE_SHOW_CAPACITY_NOTE=true`.
- Avoid keeping the admin page open unless actively moderating.
- Reduce or remove auto-loading on public boards.
- Temporarily hide read-heavy non-essential widgets.
- Ban obvious spam accounts quickly.

## Read Scaling Strategy

The core idea is:

```text
Do not make every visitor query many line docs.
Prepare public board data once, then let many visitors read the prepared version.
```

### 1. Precompute Public Feed Docs

Create documents like:

```text
publicFeeds/topPicks
publicFeeds/explore_all
publicFeeds/explore_curious
publicFeeds/explore_deeper
publicFeeds/explore_playful
publicFeeds/explore_storytime
publicFeeds/explore_unexpected
```

Each feed doc should contain ready-to-render line summaries:

```json
{
  "updatedAt": "server timestamp",
  "lines": [
    {
      "id": "line id",
      "text": "Question text",
      "category": "Curious",
      "score": 12,
      "authorName": "Anonymous",
      "promoted": false
    }
  ]
}
```

Then the public board can read 1 feed doc instead of 10 or more line docs.

### 2. Precompute Landing Stats

Create one document:

```text
publicStats/main
```

Example:

```json
{
  "communityLines": 342,
  "topLiveScore": 27,
  "promotedLines": 18,
  "updatedAt": "server timestamp"
}
```

The landing page should read this one doc instead of calculating stats from line queries.

### 3. Batch User Vote State

Instead of reading a separate vote doc for every visible line, store one compact user vote state document:

```text
users/{uid}/voteState/current
```

Example:

```json
{
  "votedLineIds": ["lineA", "lineB", "lineC"]
}
```

The app can read this once and locally mark visible lines as upvoted.

### 4. Add Browser Cache

Cache public feeds in `localStorage` or `sessionStorage` for a short time:

- Feed cache: 2-5 minutes.
- Landing stats cache: 2-5 minutes.
- User vote state cache: shorter, refresh quietly after render.

The app should show cached data instantly and refresh in the background.

### 5. Prefer Explicit Load More

If traffic grows, replace infinite scroll with a clear "Load more" button.

This prevents accidental reads caused by scrolling and makes every extra page load user-intentional.

## Cloudflare Read Cache

If public traffic grows a lot, put Cloudflare in front of public reads:

```text
Client
→ Cloudflare Worker
→ Cloudflare Cache or KV
→ Firestore only when cache is stale
```

Good cache targets:

- `GET /api/public-feed/top-picks`
- `GET /api/public-feed/explore?category=curious`
- `GET /api/public-stats`

Cache duration can start at 30-120 seconds. That is enough to absorb many repeated public reads without making the app feel stale.

Firestore should remain the source of truth. Cloudflare should only serve cached public read models.

## AI Moderation Plan

Use AI moderation later to reduce admin review work, but keep admin override forever.

Recommended flow:

```text
User submits line
→ Firestore stores status: "pending"
→ Cloudflare Worker queues moderation job
→ Queue consumer calls Gemini
→ AI returns structured decision
→ Worker updates line status
→ Admin can override decision anytime
```

Expected AI response shape:

```json
{
  "decision": "approve",
  "category": "safe",
  "confidence": 0.91,
  "reason": "Safe conversation starter"
}
```

Allowed decisions:

- `approve`: high-confidence safe line.
- `needs_review`: unclear, low confidence, different language, edgy, or context-dependent.
- `reject`: obvious spam, abuse, explicit sexual content, hate, private information, or junk.

Do not show raw AI reasons to users. Keep them internal for admins.

User-facing copy should stay soft:

```text
This line needs a quick review before it can appear.
```

or:

```text
This line did not fit the board right now.
```

## Gemini vs Gemma

Gemini and Gemma are different:

- Gemini: hosted Google API models. Best first choice for simple future moderation.
- Gemma: open/open-weight model family. Better only if we later want self-hosting or cheaper specialized moderation.

Start with Gemini API. Consider Gemma only after moderation volume and cost are real problems.

## Backend Safeguards To Add Later

Add these after launch if the app starts getting meaningful traffic:

- Firebase App Check.
- Per-user submit rate limits.
- Per-user vote rate limits.
- Transactional activity counters.
- Stricter Firestore rules.
- Cloud Functions or Workers as controlled write APIs.
- Admin-visible moderation history.
- Monitoring alerts for reads, writes, and permission errors.

## Recommended Roadmap

1. Keep current launch setup.
2. Add `publicStats/main`.
3. Add `publicFeeds/*` docs.
4. Add short browser cache for public feeds.
5. Replace infinite scroll with "Load more" if reads are high.
6. Add one compact user vote-state doc.
7. Add Cloudflare Worker cache for public feed reads.
8. Add Queue + Gemini moderation.
9. Add App Check and backend rate limiting.

This path keeps the current product intact while making Firestore reads and moderation scale gradually.
