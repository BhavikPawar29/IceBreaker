## Purpose

Owns the minimal shared core used across multiple features.

## Owns

- auth/session infrastructure
- service bootstrapping
- cross-feature helpers
- UI primitives
- global styles

## Imports From

- external libraries

## Do Not Put Here

- Feature business logic
- Feature-owned validation
- Product-specific page components

## Notes

Only keep code here when it is truly app-wide or used broadly across features.
