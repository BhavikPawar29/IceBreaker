## Purpose

Owns the user submission flow for new lines.

## Owns

- create page
- submit card and submission UI

## Imports From

- `features/board/` for line-domain validation and shared line rules
- `shared/ui/`

## Do Not Put Here

- Board browsing UI
- Admin moderation flows

## Notes

This feature depends on board-owned validation instead of duplicating line rules.
