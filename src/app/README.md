## Purpose

Owns app bootstrapping, top-level route composition, and shell wiring.

## Owns

- `App.jsx`
- `main.jsx`
- route wrapper files under `routes/`

## Imports From

- `shared/` for infrastructure and reusable UI
- `features/` for feature pages and owned components

## Do Not Put Here

- Feature-specific business logic
- Feature validation
- Route-specific UI that belongs to a feature

## Notes

Start here when you need to understand how the full application is assembled.
