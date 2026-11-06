---
name: Folio (working title)
description: A photographer platform set like a fashion monograph — photograph first, type as architecture, one blue signal.
colors:
  paper: "#F2F2EF"
  paper-bright: "#FAFAF8"
  ink: "#0D0D0C"
  ink-soft: "#4B4B47"
  hairline: "#D6D5D0"
  signal: "#0B2FD0"
  darkroom: "#0D0D0C"
  darkroom-text: "#F2F2EF"
  darkroom-dim: "#B4B3AD"
  photo-wash: "#E3E2DD"
  scrollbar: "#A9A8A2"
typography:
  display:
    fontFamily: "Bodoni Moda Variable, Didot, serif"
    fontSize: "5.5rem"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  display-compact:
    fontFamily: "Bodoni Moda Variable, Didot, serif"
    fontSize: "3rem"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  profile-name:
    fontFamily: "Bodoni Moda Variable, Didot, serif"
    fontSize: "4.5rem"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Bodoni Moda Variable, Didot, serif"
    fontSize: "2.5rem"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline-compact:
    fontFamily: "Bodoni Moda Variable, Didot, serif"
    fontSize: "1.75rem"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  wordmark:
    fontFamily: "Bodoni Moda Variable, Didot, serif"
    fontSize: "1.625rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.03em"
  lead:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  body-sm:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  title:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0em"
  body:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  caption:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.01em"
  label:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.14em"
  data:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
rounded:
  none: "0px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
  2xl: "72px"
  3xl: "120px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    height: "44px"
    padding: "0 24px"
  button-primary-hover:
    backgroundColor: "{colors.signal}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    height: "44px"
    padding: "0 16px"
  input-field:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    height: "48px"
    padding: "0 0"
  lightbox-panel:
    backgroundColor: "{colors.darkroom}"
    textColor: "{colors.darkroom-text}"
---

# Design System: Folio (working title)

> **Seed.** Written before the build, as a directional plan. After the skeleton exists, re-run `/impeccable document` in scan mode so this file describes what shipped, not what was intended.

## Overview

**Creative north star: "The Monograph."** The platform reads like a printed photography monograph that happens to be interactive: wide white margins, a photograph that owns the page, captions set like print credits, and one high-contrast serif used for names and titles only. Social features (likes, saves, comments, followers) are present but typeset as publication furniture, never as app chrome.

- **Mode by surface.** Portfolio is *Experience* (the artifact leads, the interface recedes). Profile is *Read/Experience* (editorial header, then a grid). Booking is *Operate* (scanability and clear states outrank expression).
- **Scene.** Someone on a laptop or phone in daylight, judging a photographer's work and deciding whether to follow or book. Light ground, because photographs are judged against a calm, bright wall; the full-screen lightbox goes dark like a viewing room.
- **Density.** Spaced and breathable. Whitespace is a material.
- **Signature detail.** Print **crop marks**: eight 1px ticks that draw in just *outside* a photograph's trim edge on hover or focus, as on a press sheet, while like/comment counters rise inside the frame. It uses print-production vocabulary the audience knows, and it is the only decoration on a tile. On touch devices there is no hover, so the marks are dropped and the counters stay visible.
- **Risk.** A Didone display serif is the category-expected face for fashion. It is kept upright (no italic accents), tightly tracked, and used only at large sizes, so it behaves as architecture and not as a costume.

## Colors

Restrained strategy: neutrals plus one saturated signal.

- **Paper** (`#F2F2EF`): the page ground. A cool-leaning off-white, not cream.
- **Paper bright** (`#FAFAF8`): drawer and form surface, one step lifted from the page.
- **Ink** (`#0D0D0C`): all primary text, primary buttons, and the darkroom ground.
- **Ink soft** (`#4B4B47`): secondary text on paper. About 7.8:1 against paper.
- **Hairline** (`#D6D5D0`): rules and field underlines. Never used for text.
- **Signal** (`#0B2FD0`): a flat ultramarine, hue about 229°. Used for the liked/saved state, focus ring, text selection, the active tab rule, and button hover. Never a gradient, never on large fields.
- **Darkroom text / dim** (`#F2F2EF` / `#B4B3AD`): text on the lightbox. Dim is about 9:1 on ink.
- **Photo wash** (`#E3E2DD`): the tile ground shown while an image loads, so layout never jumps.

Rules: secondary text is tinted from its surface, never a bare gray; every text pair is at least 4.5:1.

## Typography

- **Display and headline: Bodoni Moda (variable).** Photographer names, page titles, series titles, lightbox titles. Display scales fluidly from `display-compact` (3rem) to `display` (5.5rem, never above 6rem); headline from `headline-compact` (1.75rem) to `headline` (2.5rem). The profile name tops out at `profile-name` (4.5rem), and the header wordmark is `wordmark` (1.625rem). Weight 400, tracking −0.03em on display sizes. Never set below 1.75rem, where the hairlines break up.
- **Interface and body: Hanken Grotesk (variable).** Body is 1rem. `lead` (1.0625rem) is for bios and introductions; `body-sm` (0.9375rem) for tile titles, comment text and mobile stats; `caption` (0.8125rem) for meta. Body measure 65–75ch.
- **Data: Geist Mono.** Only for measurement: EXIF values and booking amounts, with tabular figures.
- **Labels.** Tab and button labels use 0.75rem, weight 500, uppercase, tracking 0.14em. No eyebrow or kicker is ever set above a heading.
- Headings use `text-wrap: balance`.

## Layout

- **Grid.** 12 columns, max width 1440px, outer margin 40px (20px on mobile), gutter 20px (12px on mobile). Strict: every edge lands on the grid.
- **Portfolio gallery.** True masonry: 2 columns on mobile, 3 on desktop, 4 on wide screens. Each tile reserves its own aspect ratio before the image loads. Captions sit below the image.
- **Profile grid.** 3 columns of 4:5 tiles at every size, because the Instagram-style rhythm is a stated requirement.
- **Rhythm.** More space above a heading than below it. Sections separate with 72–120px of air, not with rules and boxes.
- **No containers for containers.** Content sits directly on the paper; no cards, no cards inside cards.
- **Responsive.** The header collapses its nav to inline text links; the lightbox stacks image above information; the booking drawer becomes full width below 640px. Under 640px the "Portfolio" link gives way to an account icon.
- **Auth.** A 60/40 split from 1024px: sticky full-height imagery left (3fr), paper form column right (2fr) with generous padding and a 30rem measure. Below 1024px the imagery becomes a 30svh band above the form. The site header is not shown on auth screens.

## Elevation & Depth

Flat. Depth comes from the page-to-darkroom shift, not shadows. The booking drawer separates from the page with a 48% ink scrim and a single soft shadow (`0 24px 64px -24px rgba(13,13,12,0.35)`), offset and blurred. No glass, no blur, no glow, no hard offset shadows.

## Shapes

Square. `0px` radius on buttons, fields, tiles, and panels. Round shapes (`9999px`) are limited to the profile avatar and radio indicators, which stay circular so they never read as checkboxes.

## Components

Planned structure (components compose; none nests a card in a card):

```
App (router)
├─ AppShell
│  ├─ SiteHeader        wordmark, nav links, "Book a shoot" button
│  ├─ <Outlet />
│  └─ SiteFooter        demo-content notice
├─ pages/
│  ├─ FeedPage          For you / Following, infinite list of PostCards, suggestions rail
│  ├─ PostPage          one post at its permalink
│  ├─ ExplorePage       everyone's photographs in a MasonryGrid, with a category filter
│  ├─ ProfilePage       ProfileHeader, ProfileTabs, tab panels
│  ├─ auth/             LoginPage, RegisterPage (3 steps), VerifyPage (OTP)
│  ├─ DashboardPages    role landings: Studio, Client portal, Feed
│  └─ NotFoundPage
├─ gallery/
│  ├─ MasonryGrid       column layout, reserved aspect ratios
│  ├─ PhotoTile         button + image + crop marks + counters
│  └─ PhotoViewer       dialog lightbox: image, story, EXIF, actions, comments
├─ feed/
│  ├─ PostCard          header, media, actions, body; no card chrome
│  ├─ PostHeader        avatar, handle, location, follow toggle
│  ├─ PostMedia         scroll-snap carousel, dot bars, double-tap to like
│  ├─ PostActions       like, comment, share (copies the permalink), save
│  ├─ PostBody          likes, truncated caption, comment preview, inline comments, timestamp
│  ├─ SuggestedUsers    borderless list with follow toggles
│  └─ Avatar, PostSkeleton
├─ messages/
│  ├─ ThreadList        borderless rows, presence dot, unread count, quiet wash on the open thread
│  ├─ ChatView          header, message log, reserved typing line, composer
│  ├─ MessageBubble     plain blocks (ink for you, wash for them); delivery state in micro-type
│  ├─ Composer          Enter sends, up to four photographs
│  └─ TypingIndicator   three dots rising in turn
├─ settings/
│  ├─ AvatarDrop        circular drop target; crops to a square instantly
│  ├─ CategoryTags      up to three text toggles with an underline
│  └─ ProfilePreview    live miniature of the public profile
├─ profile/
│  ├─ ProfileHeader     avatar, name, handle, inline stats, bio, Follow / Book
│  ├─ ProfileTabs       Grid · Series · Tagged (roving-tabindex tablist)
│  ├─ SeriesList        editorial rows, not cards
│  └─ TaggedEmpty       designed empty state
├─ social/
│  ├─ LikeButton        aria-pressed toggle
│  ├─ SaveButton        aria-pressed toggle (mood boards are a later step)
│  └─ CommentPanel      expandable region + local add-comment form
├─ auth/
│  ├─ AuthShell         60/40 split; cross-fades between Login, Register and Verify
│  ├─ AuthMedia         placeholder imagery loop with a slow reveal and pointer parallax
│  ├─ FloatingField     floating label, hairline underline, signal line on focus, 4px nudge on error
│  ├─ OtpInput          six segmented cells with auto-advance, paste and autofill
│  └─ OAuthButtons      text-only Google / Apple, with an honest "not connected" notice
├─ booking/
│  ├─ BookingDrawer     right-hand sliding dialog
│  ├─ TierSelect        radio group of event tiers
│  ├─ BudgetRange       dual-thumb range slider
│  └─ field primitives  label + underline input
└─ ui/
   ├─ Sheet             shared modal dialog with enter/exit motion
   └─ Button
```

State that crosses components lives in three small contexts: `Social` (likes, saves, comments), `Viewer` (which photo is open), `Booking` (drawer open/closed).

Key behaviors:
- **Button.** Primary is ink on paper; hover turns the ground to signal (180ms). Pressed moves 1px down. Disabled drops to 40% and loses the pointer.
- **Tab.** Label plus a 2px signal rule that draws left to right (220ms) when active.
- **Field.** Label above, 1px hairline underline, signal underline on focus, error text names the problem and the fix.
- **Floating field.** No box. A 1px ink-soft underline, a 2px signal line that draws in from the left in 180ms on focus, and a label that floats up and scales to 0.78 in 180ms. The message line below always reserves its height, so errors never shift the layout. Invalid fields thicken to a 2px ink underline.
- **OTP cell.** Six underlined cells in Bodoni at 2.5rem. Filled cells take an ink underline, the focused cell a signal one.
- **Photo tile.** Button. Hover or focus draws the crop marks and reveals like and comment counters bottom-left; on touch devices counters are always visible.

## Do's and Don'ts

**Do**
- Let the photograph be the largest, highest-contrast thing on every screen.
- Use whitespace to separate; use hairlines only for fields and tab rules.
- Keep one signal color, and spend it on state and focus.
- Mark every placeholder photograph, name, and count as demonstration content.

**Don't**
- No purple-to-blue gradients, gradient text, glass, glow, or hard offset shadows.
- No cards inside cards, no three-column feature blocks, no hero-metric number blocks.
- No kicker or eyebrow above a heading; no section numbers.
- No italic display accents.
- No gray text on colored backgrounds; tint from the surface.
- No entrance from `scale(0)`; no `ease-in`/`ease-out` keywords.

## Motion

- **Curve.** Everything uses `cubic-bezier(0.16, 1, 0.3, 1)` (`--ease-premium`). The browser keywords `ease`, `ease-in`, `ease-out`, and `linear` are not used for UI motion.
- **Durations.** 160ms for hover and press, 220ms for tabs and crop marks, 280ms for dialogs and the drawer. Nothing exceeds 300ms.
- **Entrances.** Y-shift (8–16px) with opacity, or scale from 0.95. Never from 0.
- **One authored moment.** On first load, gallery tiles rise 12px and fade in with a 40ms stagger, capped at 8 tiles. Nothing else on the page repeats it.
- **Feed.** Posts rise 12px and fade in over 280ms as each page arrives. Double-tap shows a heart that scales 0.95 to 1.04 and fades over 360ms. The active carousel dot stretches into a bar over 220ms. Likes and saves flip instantly, before the request returns.
- **Upload and settings.** A newly published cell fades in from scale 0.97 over 260ms. Settings tabs slide 18px in the direction of travel and fade (220ms in, 180ms out). The toast slides down from the top edge in 240ms and leaves in 200ms. Unsaved fields turn their 1px baseline signal blue; saving clears it.
- **Messages.** Bubbles rise 10px and fade in over 220ms, staggered 30ms by position (capped at eight). The typing dots rise 4px in turn over 1.3s.
- **Auth surface.** Views cross-fade: the outgoing view fades up and out in 200ms while the incoming one fades and slides in 10px over 260ms. Register steps slide 12px in the direction of travel. A failed attempt nudges the field 4px (then −3px, then back) over 220ms using a transform only, so nothing shifts. The imagery loop holds each still for 7s, cross-fades over 1.2s, and drifts in over 1.6s; pointer parallax moves it at most 7px. These ambient motions are the only ones above 300ms.
- **Reduced motion.** `prefers-reduced-motion: reduce` removes transforms and shortens fades to 1ms. The imagery loop, parallax and error nudge are switched off.
