# Live Prompt Migration

Breaking Ice V2 can read live prompts from existing approved `lines` documents.
The new fields are optional so old documents continue to work.

## Fields

- `situation`: `any`, `date`, `crush`, `new-friends`, or `group-chat`
- `pack`: `playful`, `deep`, or `flirty`
- `followUps`: up to two `{ label, text }` objects

## Live sequence

1. Deploy Firestore rules first:

```powershell
npx firebase-tools deploy --only firestore:rules --project icebreaker-70b95
```

2. Run a dry-run against live Firestore:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account.json"
node scripts\migrate-live-prompts.mjs --limit=50
```

3. Review the JSON preview. If it looks correct, apply:

```powershell
node scripts\migrate-live-prompts.mjs --limit=50 --apply
```

Increase `--limit` only after a small successful batch. The script only touches
approved `lines` and only backfills the optional Live Mode metadata.
