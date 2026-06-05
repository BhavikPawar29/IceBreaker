# Analytics Guide

This document explains what the current Firebase / GA4 analytics setup means in IceBreaker, what each event tells us, and how to read user behavior without guessing from the default dashboard cards.

## Core idea

Do not rely only on default GA metrics like `Active users`, `Views`, or page titles.

Those are useful, but they do not fully answer:

- who was new
- who returned
- who clicked login
- who actually logged in
- who reached Live Mode
- who used the product
- where users dropped off

The app now sends a mix of:

- default GA/Firebase events
- route-level events
- CTA/button intent events
- product success events

## What default Firebase / GA means

### Active users

`Active users` does **not** mean "logged-in users only".

It means users GA considered active/engaged in the selected time range.

This can include:

- visitors who never signed up
- visitors who were not logged in
- returning logged-in users

### page_view

`page_view` means a page was viewed.

Reloading or revisiting can increase this.

### session_start

`session_start` means a visit/session started.

One user can create multiple sessions.

### first_visit

`first_visit` means this browser/device was seen for the first time by GA.

This is the closest default signal for "new visitor".

### user_engagement

`user_engagement` is a GA engagement signal.

It means the visit had enough engagement for GA to count it meaningfully.

## Why page titles were confusing

The app starts with the base HTML title:

- `Breaking Ice`

Then React updates titles using the shared SEO component.

That means GA title-based reports can show entries like:

- `Breaking Ice`
- `Conversation Help for Awkward Moments`

even when users were really on different routes.

Because of that, page-title reports are not the best source of truth for route analysis.

## Route tracking added

The app now sends a custom event:

- `route_view`

This is the cleanest way to understand which page a user actually reached.

### route_view parameters

- `route_path`
- `route_title`
- `route_type`

### route_path meanings

- `/` = landing page
- `/login` = login page
- `/live` = Live Mode
- `/lines` = Explore
- `/promoted` = Top Picks
- `/create` = Share / submit page
- `/profile` = signed-in user's own profile
- `/profile/:id` = public contributor profile
- `/line/:id` = public line detail page
- `/admin` = admin page

## CTA/button events added

The app also sends intent-level events so we can distinguish:

- "user reached page"
- "user clicked a button"

### CTA events

- `cta_clicked`
- `nav_clicked`
- `auth_submit_clicked`
- `auth_mode_switched`
- `password_reset_requested`
- `logout_prompt_opened`
- `logout_cancelled`
- `logout_confirmed`

### What they mean

#### cta_clicked

Used for major marketing/landing/hero CTAs.

Useful params:

- `cta_location`
- `cta_name`
- `destination`

#### nav_clicked

Used for header or mobile nav clicks.

Useful params:

- `nav_label`
- `destination`
- `nav_surface`

#### auth_submit_clicked

Means the user pressed a login/signup auth submit action.

Useful params:

- `auth_method`
- `auth_mode`

Examples:

- Google login click
- email login click
- email signup click

#### auth_mode_switched

Tracks switching between login and signup modes.

Useful params:

- `from_mode`
- `to_mode`

#### password_reset_requested

Tracks a password reset request attempt.

## Product action events

These events tell us whether users actually used the product, not just visited.

### Existing product events

- `login`
- `sign_up`
- `live_prompt_requested`
- `live_prompt_empty`
- `line_submitted`
- `vote_cast`

### What they mean

#### login

A successful login happened.

Useful param:

- `method`

#### sign_up

A successful signup happened.

Useful param:

- `method`

#### live_prompt_requested

The user actually used Live Mode and requested a prompt.

Useful params:

- `pack`
- `situation`
- `prompt_source`

#### live_prompt_empty

The user asked for a prompt but there was no matching prompt for that filter.

Useful params:

- `pack`
- `situation`

#### line_submitted

The user successfully submitted a line.

Useful params:

- `category`
- `pack`
- `situation`

#### vote_cast

The user successfully voted or removed a vote.

Useful param:

- `action`

## How to interpret behavior

### New visitor

Use:

- `first_visit`
- `route_view /`

### Returning visitor

Use:

- `session_start`
- `route_view`
- no new `first_visit`

### Clicked login but did not complete login

Pattern:

- `cta_clicked` or `nav_clicked` to `/login`
- `route_view /login`
- no `login`
- no `sign_up`

### Logged in successfully

Pattern:

- `auth_submit_clicked`
- `login`

### Signed up successfully

Pattern:

- `auth_submit_clicked`
- `sign_up`

### Reopened the app while still logged in

Pattern:

- `route_view /live` or other in-app page
- no new `login`

### Actually used the product

Look for:

- `live_prompt_requested`
- `line_submitted`
- `vote_cast`

### Reached Live Mode but did not use it

Pattern:

- `route_view /live`
- no `live_prompt_requested`

### Tried to use Live Mode but nothing was available

Pattern:

- `route_view /live`
- `live_prompt_empty`

## Recommended basic funnels

### Visitor to login funnel

1. `route_view /`
2. `cta_clicked` or `nav_clicked` with destination `/login`
3. `route_view /login`
4. `login` or `sign_up`

### Login to product-use funnel

1. `login` or `sign_up`
2. `route_view /live`
3. `live_prompt_requested`

### Contribution funnel

1. `route_view /create`
2. `line_submitted`

### Engagement funnel

1. `route_view /lines`
2. `vote_cast`

## Best places to inspect this in Firebase / GA

### Realtime

Use this for quick verification right after testing.

### DebugView

Use this for the clearest event-by-event testing of your own session.

This is the best place to confirm:

- `route_view`
- `cta_clicked`
- `nav_clicked`
- `login`
- `sign_up`
- `live_prompt_requested`

### Events

Use this for aggregate counts after GA has processed data.

Look for:

- `route_view`
- `cta_clicked`
- `nav_clicked`
- `auth_submit_clicked`
- `login`
- `sign_up`
- `live_prompt_requested`
- `line_submitted`
- `vote_cast`

## Important cautions

### Active users is not enough

Do not use `Active users` alone to judge conversion.

It does not tell you:

- clicked login
- successful login
- used Live Mode
- submitted line
- voted

### Page title reports are imperfect

Do not depend on page-title reports for route analysis.

Use `route_view` instead.

### Analytics does not equal auth database

Firebase Auth tells you who has an account.

Analytics tells you who visited, clicked, and used the product.

You need both to understand behavior properly.

## Short summary for teammates

If you want to know:

- where users went -> use `route_view`
- what they clicked -> use `cta_clicked` and `nav_clicked`
- whether they attempted auth -> use `auth_submit_clicked`
- whether auth succeeded -> use `login` and `sign_up`
- whether they used the actual product -> use `live_prompt_requested`, `line_submitted`, `vote_cast`
- whether they were new -> use `first_visit`
- whether they came back -> use repeated `route_view` / sessions without `first_visit`
