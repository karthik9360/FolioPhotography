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

- Portfolio gallery: an asymmetric lookbook (hero spreads at 16:9 across 8 of 12 columns, tall frames at 4:5 across 4, in alternating pairs), a full-screen viewer with the story and "Camera info", and photos or videos in the same grid.
- Social profile view: a typographic masthead (name, username, one line of counts, bio; no avatar plate) and tabs for Lookbook, Series and Tagged. `/:username/feed` is that photographer's lookbook of posts and 3D models, open to every role.
- Social interaction: Like, Comment, Share and Save as plain text actions on the post page (no icon row); save to mood boards; expandable comments.
- Booking: drawer or dedicated page with a date picker, budget range slider, and event tier selection.
- Lookbook feed (`/feed`): the newest posts from many photographers (and their 3D models) as one asymmetric grid, a cover per post, with infinite loading, For you and Following, and a suggestions row. A cell opens its post page (`/post/:id`) with carousels, playable videos and the actions. Share opens a panel: send in a message, or WhatsApp, Telegram, X, Facebook, email, the device's share sheet or copy link. Explore (`/explore`) is a search console: one large field and two tabs, Photographers and Posts, with nothing pre-loaded and flat results.
- Upload (`/upload`, photographers): up to ten photos and videos per post in a borderless drop zone, with caption and camera info (read from photos, editable) and a "Photo details" panel. Videos get a cover frame and length; a video the browser cannot play is still accepted. Videos are recognised by type or by common extensions (mp4, mov, webm, m4v, avi, mkv, mpeg, 3gp, wmv and `.ansl`; "ANSL" is not a format the team could identify, so it is accepted by extension on a best guess). Loading shows only a thin gold strip on the top edge. Posts live in memory for the session; real storage needs a backend.
- Profiles at `/:username` for every account, including newly registered ones. A private account's grid and posts are hidden from people who do not follow it.
- Settings: Account (email, password, private switch; email and password changes need the current password) and Profile (avatar with drop-and-crop, display name, username, 150-character bio, up to three categories, live preview). Saves are optimistic with a top-edge status strip.
- Messages (`/messages`): split pane, online status, unread counts, image sharing, Sent / Delivered / Read, typing indicator. Real-time is simulated on timers until a server exists.
- Role-based interface: the three demo identities are `photographer@demo.test` (creator, `studio_karthik`), `client@demo.test` (client, `vogue_editorial`, shown as "Editorial Desk") and `follower@demo.test` (follower, `anand_kumar`). Each role gets its own navigation and entry view (creator: Studio; client: Campaign Review Board, no public feed or Book button; follower: the feed). A demo-only footer control switches roles without a password; a real backend must remove it.
- Studio pipeline (`useStudioPipeline`): campaigns, invoices, proofs, notes and deliveries shared by all roles. Billing (`/studio/billing`) shows the client a payment summary and a simulated UPI payment (no money moves) and the photographer a deck to issue invoices, adjust packages and mark invoices paid. The client reviews proofs, selects, approves for retouching and adds notes; the photographer delivers the approved files.
- Curation (`useCreativeHub`, `/studio/curate`): a batch is analysed locally for colour, light and near-duplicates, grouped into mood groups, given rule-based tonal notes and tag suggestions (not a generative model), and sorted into piles.
- 3D models: a feed item flagged `type: '3d'` renders a WebGL canvas (three.js, loaded on demand): an onyx stage, a low fill light and one spotlight, a constrained, damped orbit (no zoom, so the wheel still scrolls), cursor parallax, arrow keys, and a text notice without WebGL. The three shapes (draped cloth, pleated panel, knot) are procedural stand-ins, not any photographer's work; there is no glTF/GLB loading yet.
- Role-adaptive cells: a photographer sees a private note on their own work; a client sees Approve, Ask for changes and Hold; a follower sees New on posts since their last visit, plus Follow and Book. The notes, tags and last-seen time are demo state in the browser, kept per identity (`useCreativeHub`), as are staged uploads and the last page each identity had open.
- Look: warm linen is the default (bone `#F5F5F0`, charcoal `#1F1F1E`, muted gold `#C5A880` and olive `#8C927D` for active lines, the loading strip and confirmation buttons); Dark is the option. Type is compact (headers at most 16px, secondary text 10-11px) and every word a person reads is everyday language. See DESIGN.md.
- Header: role-based links, Sign out or Sign in / Join always on screen, no Book button (booking lives on each photographer's page).
- Still to build from the owner's briefs: stories and reels; a notification drawer; the proof loupe and region notes; the delivery page with downloads; regional feeds (Chennai, Tirunelveli); syndication and media kits (`/studio/syndicate`); secure mood boards; real glTF/GLB model loading.
- Accounts: sign in / join; three-step registration (details, username, role); 6-digit one-time-code verification; Google and Apple sign-in; role-based landing (photographer to a studio page, client to the proofing portal, follower to a feed). Sessions use JWTs with persistence.

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
