# UI State Rules

Use these 4 states for every data-driven surface:

1. Loading
2. Error
3. Loaded
4. Empty

## Required rule

Before shipping a screen, answer these questions explicitly:

- What does the user see while data is loading?
- What does the user see when the request fails?
- What does the user see when the request succeeds with useful data?
- What does the user see when the request succeeds but nothing useful exists yet?

If any of these states are missing, the UI is incomplete.

## Design expectations

- Loading should feel intentional.
  Use skeletons, shimmer, pulse feedback, or meaningful progress copy.
- Error should be actionable.
  Give the user a retry path, change path, or way back.
- Empty should not be a dead end.
  Explain why it is empty and suggest the next best action.
- Loaded should still breathe.
  Preserve whitespace, hierarchy, and obvious primary and secondary actions.

## Whitespace rule

Whitespace is part of the state design, not decoration.

- Loading, empty, and error states usually need more vertical breathing room.
- Dense spacing makes a correct state feel broken or low confidence.
- Empty and error cards should not be collapsed into a single red text line when a larger state treatment would make the path clearer.

## Reusable pattern in this repo

- Use `StatePanel` for empty, error, and compact loading states.
- Use `RouteShimmer` for route-level skeleton loading.
- Prefer one clear state treatment per screen instead of mixing multiple weak signals.
