# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React with Vite, Tailwind CSS, Lucide React, React Router. The brief offered "Vite or Next.js" and "Tailwind or styled-components"; the choice was delegated, and Vite + Tailwind was picked because nothing in the brief needs server rendering or a backend yet. Revisit if SEO-indexed public profiles become a requirement.

## Users

- **Photographers** (profile owners): publish work, build a following, receive bookings.
- **Visitors and followers**: browse, like, save to mood boards, comment, discover photographers.
- **Prospective clients**: judge a photographer's work and send a booking enquiry (date, budget, event tier).

Each account carries one role: creator (photographer), client, or follower (confirmed by the auth brief). *Inferred, not confirmed:* the relative priority of these groups, and whether one person may ever hold more than one role.

## Product Purpose

A web platform for photographers that combines three jobs in one place: a portfolio showcase, social discovery in the style of Instagram/Facebook profiles, and client booking. Success is a photographer's work being seen first and a qualified booking enquiry following without leaving the page.

It is a community of many photographers, in the manner of Instagram, and not a single portfolio: a public feed and an Explore grid show many photographers' work side by side, and each photographer has their own profile. (Confirmed by the owner when the single-portfolio first draft was rejected.)

## Positioning

*Inferred from the brief:* a single editorial-grade surface where portfolio, social proof, and booking live together, rather than a portfolio site plus a separate social profile plus a separate booking tool. Needs confirmation.

## Operating Context

Visitors browse image-led pages on desktop and mobile. Photographers supply the photographs, stories, and EXIF data that the page presents. Booking enquiries are structured (date, budget range, event tier).

## Capabilities and Constraints

Required by the brief:

- Portfolio gallery: masonry grid, dynamic aspect-ratio containment, full-screen lightbox with EXIF data and story overlay.
- Social profile view: avatar and header, follower/following counts, biography, tabs for Grid, Series/Collections, and Tagged; like and comment counters revealed on hover over grid items.
- Social interaction: like, save/bookmark to mood boards, expandable comment panels.
- Booking: drawer or dedicated page with a date picker, budget range slider, and event tier selection.
- Social feed (`/feed`): single-post vertical scroll of posts from many photographers, with infinite loading; For you and Following; multi-image carousels, double-tap to like, like, comment, share and save; a suggestions rail. Each post has a permalink (`/post/:id`). Explore (`/explore`) is a grid of everyone's photographs.
- Upload (`/upload`, photographers): up to four photographs per post with caption and EXIF (read from the file, editable). Publishing adds the post to the top of the photographer's profile and the feed at once, then opens their profile at `/:username`. New posts live in memory for the session; real storage needs a backend.
- Profiles at `/:username` for every account, including newly registered ones. A private account's grid and posts are hidden from people who do not follow it.
- Settings: Account (email, password, private switch; email and password changes need the current password) and Profile (avatar with drop-and-crop, display name, handle, 150-character bio, up to three categories, live preview). Saves are optimistic with a top-edge toast.
- Messages (`/messages`): split pane, online status, unread counts, image sharing, Sent / Delivered / Read, typing indicator. Real-time is simulated on timers until a server exists.
- Still to build from the owner's briefs: stories and reels, a notification drawer, and light and dark themes.
- Accounts: sign in; three-step registration (details, handle, role); 6-digit one-time-code verification; Google and Apple sign-in; role-based landing (photographer to a studio page, client to the proofing portal, follower to a feed). Sessions use JWTs with persistence.

Undecided (do not invent): backend and data model, the real auth service and token strategy (the demo uses an unsigned mock), how one-time codes are delivered (email or SMS), OAuth credentials, password reset, session lifetime, how comments and follows are stored, payment or deposit handling, moderation, the product name, whether Tagged means photos of the user or photos by others.

## Brand Commitments

Binding, from the brief:

- Premium, high-fashion editorial; minimalist luxury / editorial tech. Spaced, breathable, high whitespace; the photography carries the visual weight.
- Clean, high-contrast, typographically driven. Strict editorial grids, generous negative space, premium tracking on headings.
- Forbidden: purple-to-blue gradients, cards inside cards, generic three-column feature blocks, low-contrast gray text on colored backgrounds (minimum 4.5:1).
- Motion: every animation intentional; micro-interactions under 300ms; no scale(0) entrances (subtle Y shifts or scale 0.95 to 1 only); no generic ease-in/out, use custom cubic-bezier curves such as `cubic-bezier(0.16, 1, 0.3, 1)`.
- Icons: Lucide React with light stroke weights.

No product name or logo exists yet; any wordmark in the build is a working title.

## Evidence on Hand

None. There are no photographs, photographer profiles, follower counts, testimonials, or pricing. Everything shown in the build is synthetic demonstration content and must be labelled as such until real material replaces it. Do not fabricate real-sounding customers, awards, or statistics.

## Product Principles

1. The photograph leads; interface chrome recedes and never competes with an image.
2. Social features must feel like part of an editorial publication, not a feed bolted onto a portfolio.
3. Booking is a first-class action, reachable from any profile without losing the user's place.
4. Motion confirms what the user did; it never decorates or delays.
5. Every claim, count, and credential shown is either real or visibly marked as a placeholder.

## Accessibility & Inclusion

Minimum 4.5:1 contrast for body text. Keyboard-operable gallery, lightbox, tabs, comment panels, and booking form, with visible focus. Respect `prefers-reduced-motion`.
