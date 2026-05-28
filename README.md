# Breaking Ice

Breaking Ice is a fast conversation assistant for awkward real-life moments. It helps a signed-in user pick a situation, choose the vibe, and get one natural line to say without scrolling through a feed.

The product is not an AI backend or a giant content library. Live Mode pulls approved conversation lines from Firestore, filters them by situation and pack, and shows one useful line at a time.

## Product Focus

- Give users something usable to say quickly.
- Keep Live Mode simple enough to use during a conversation.
- Support common moments like dates, crushes, new friends, and quiet group chats.
- Keep the community board as a secondary place to submit, review, vote on, and discover lines.

## Main Features

- `/live` - signed-in live assistant for one filtered conversation line at a time
- Situation filters: date, crush, new friends, group chat
- Question packs: playful, deep, flirty
- Share flow for sending a line with a relatable awkward-moment message
- Community board for submitted lines and voting
- Admin moderation and live-filter editing for approved lines
- Profile and public line pages for submitted ideas

## App Routes

- `/` - landing page
- `/login` - sign-in and sign-up
- `/live` - instant conversation assistant
- `/lines` - community board
- `/promoted` - top picks
- `/create` - submit a line
- `/profile` - signed-in user's contributions
- `/profile/:id` - public profile
- `/line/:id` - public line page
- `/admin` - moderation and line management

## Data Model

Live Mode uses the existing `lines` collection. New and updated line documents can include:

- `text`
- `status`
- `category`
- `situation`
- `pack`
- `createdByUid`
- `createdAt`
- `updatedAt`

Only approved lines are eligible for Live Mode. Older lines can be backfilled with `situation` and `pack` through the admin UI or the migration script.

## Tech Stack

- React
- Vite
- React Router
- Firebase Authentication
- Cloud Firestore
- Firebase Hosting
- vite-plugin-pwa

## Local Development

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Run lint:

```bash
npm run lint
```

Build for production:

```bash
npm run build
```

## Environment Setup

Create a `.env` file from `.env.example` and fill in the Firebase Web App values:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_FIREBASE_APP_CHECK_SITE_KEY=
VITE_ENABLE_APP_CHECK=false
VITE_APP_CHECK_DEBUG_TOKEN=
```

For local development, keep `VITE_ENABLE_APP_CHECK=false` unless you have registered a valid Firebase App Check debug token. If Firebase Auth App Check enforcement is enabled in the Firebase Console, local sign-in needs either enforcement disabled for dev or a valid debug token.

## Firestore Rules

The rules are in `firestore.rules`. Deploy rules with:

```bash
npm run firebase:deploy
```

That script deploys Firebase Hosting and Firestore rules/indexes.

## Migration

The live prompt migration script can backfill old approved lines with live filters:

```bash
npm run migrate:live-prompts
```

It runs as a dry run by default. Use `-- --apply` only after reviewing the planned changes and setting Firebase Admin credentials.
