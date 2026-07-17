## Purpose

Owns moderation and admin review surfaces.

## Owns

- admin dashboard page
- admin dashboard data hook

## Imports From

- `shared/lib/`
- `shared/core/`
- board-owned domain constants and formatting helpers
- `shared/ui/`

## Do Not Put Here

- End-user profile UI
- Public landing content

## Notes

Keep moderation-only logic here even when it touches shared line-domain data.
