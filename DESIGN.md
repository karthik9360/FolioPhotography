---
name: Folio (working title)
description: A photographer platform set in glass on a deep gradient — a cursive voice, a pink accent, a floating 3D lens, and a lookbook that stays the loudest thing on the page.
colors:
  teal-inner: "#0B8A78"
  teal-mid: "#044E3B"
  teal-outer: "#011411"
  blue-inner: "#0B4F8A"
  blue-mid: "#04294E"
  blue-outer: "#010C14"
  ink: "#FFFFFF"
  ink-soft: "rgba(255, 255, 255, 0.76)"
  hairline: "rgba(255, 255, 255, 0.16)"
  glass: "rgba(255, 255, 255, 0.08)"
  glass-border: "rgba(255, 255, 255, 0.2)"
  photo-wash: "rgba(255, 255, 255, 0.07)"
  signal: "#FBCFE8"
  signal-hover: "#FDE7F3"
  mint: "#A7F3D0"
  on-accent: "#011D17"
  glass-dark: "rgba(0, 0, 0, 0.5)"
  glass-dark-hover: "rgba(0, 0, 0, 0.7)"
  hero-wash: "rgba(16, 185, 129, 0.1)"
  vignette: "rgba(0, 0, 0, 0.35)"
  mask: "#000000"
  darkroom: "#0A0A0A"
  darkroom-text: "#F5F5F0"
  darkroom-dim: "#B4B3AD"
typography:
  hero-title:
    fontFamily: "Galada, Brush Script MT, cursive"
    fontSize: "clamp(5rem, 10vw, 12rem)"
    fontWeight: 400
    lineHeight: 0.8
    letterSpacing: "normal"
  display:
    fontFamily: "Galada, Brush Script MT, cursive"
    fontSize: "clamp(1.75rem, 1.2rem + 1.6vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "normal"
  headline:
    fontFamily: "Galada, Brush Script MT, cursive"
    fontSize: "1.375rem"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "normal"
  logo:
    fontFamily: "Galada, Brush Script MT, cursive"
    fontSize: "1.4rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
  auth-title:
    fontFamily: "Galada, Brush Script MT, cursive"
    fontSize: "2rem"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "normal"
  field-touch:
    fontFamily: "Inter Variable, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0em"
  search:
    fontFamily: "Galada, Brush Script MT, cursive"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Inter Variable, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0em"
  description:
    fontFamily: "Inter Variable, system-ui, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  caption:
    fontFamily: "Inter Variable, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "0.01em"
  nav:
    fontFamily: "Manrope Variable, system-ui, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0em"
  label:
    fontFamily: "Manrope Variable, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.1em"
  data:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
rounded:
  print: "10px"
  tile: "12px"
  bubble: "18px"
  thumb: "20px"
  card: "28px"
  pill: "100px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    height: "32px"
    padding: "0 18px"
  button-quiet:
    backgroundColor: "rgba(0, 0, 0, 0.5)"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "32px"
    padding: "0 18px"
  nav-pill:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
    padding: "4.8px"
  nav-item-active:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    padding: "8.8px 17.6px"
  look-card:
    backgroundColor: "rgba(255, 255, 255, 0.05)"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    width: "135px"
    padding: "80px 16px 16px"
  drop-zone:
    backgroundColor: "{colors.photo-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "24px 16px"
  lightbox-panel:
    backgroundColor: "{colors.darkroom}"
    textColor: "{colors.darkroom-text}"
---

# Design System: Folio (working title)

## Overview

**North star: "Glass over deep water."** The site is a dark gradient the colour of a pool at dusk, with frosted glass floating on it, a cursive voice, one soft pink accent and a few translucent bubbles rising behind everything. The work (photographs, video, 3D) is always the brightest and most saturated thing on screen; the interface stays calm and small so it can sit on top.

- **Two moods, one switch.** Teal (the default) and Blue share every token; only the gradient changes. The change morphs over 1.5s and is remembered.
- **Mode by surface.** The home hero, profiles, the feed and 3D cells are *Experience*: the artifact leads. Upload, settings, billing and review are *Operate*: clarity and clear states come first. Both use the same glass, type and colour.
- **Density.** Page titles are large and cursive; everything else is compact (body 12px, fields and labels 10–11px). Whitespace separates; thin lines are rare.
- **Language.** Plain words: "Photo details", "Camera info", "Username", "Sign in / Join", "Photographers", "Posts". Errors say what happened and what to do.
- **Not an Instagram clone.** No circular avatars (rounded squares only), no uniform square grid, no icon row under media, no bottom toolbar, no centre spinner.

## Colors

One attribute on `<html>` (`data-theme`: `teal` or `blue`), set before first paint and remembered in the browser. The three gradient colours are registered CSS properties, so the browser animates them; panels, sheets and depth are derived from them and morph in step.

- **Gradient.** `radial-gradient(circle at center, inner 0%, mid 50%, outer 100%)` on a fixed layer behind the page. Teal is `#0B8A78 → #044E3B → #011411`. Blue is `#0B4F8A → #04294E → #010C14`.
- **Shade.** Working screens sit under a darkening layer (`--shade`, 0.5) so small text always reads; the home hero sets it to 0 and shows the gradient at full strength. Dropping it on the hero is what lets the lens glow.
- **Ink** is white. **Ink soft** is white at 76%, at least 4.5:1 on every surface (the test suite scans every visible text element).
- **Signal, pink** (`#FBCFE8`): the active nav pill, confirmation buttons, the loading strip, the status strip, the frame on a hovered work, avatar plates. Text on pink is `#011D17` (about 14:1). **Mint** (`#A7F3D0`) marks online presence and approvals.
- **Glass.** White at 5–8% with a 1px white line at 10–20% and a blur. Never a solid grey card.
- **Darkroom** (`#0A0A0A`) is the stage for 3D cells and the full-screen viewer, in both moods.
- White ink and the bubble highlights are the only whites; there is no pure black.

## Typography

- **Headings: Galada**, a cursive face, in sentence case with normal tracking. `hero-title` (the home page's two giant titles) is `clamp(5rem, 10vw, 12rem)` with a 0.8 line height. `display` (page titles) is 1.75–2.5rem, `headline` (section titles) 1.375rem. Photo titles on cells are Galada at 1.125rem.
- **Reading: Inter**. Body 12px, captions and fields 11px, form messages 10px, the hero description 1.1rem.
- **Navigation and labels: Manrope**. Nav items 0.85rem sentence case; `label` is 11px, 600, uppercase, tracking 0.1em.
- **Data: Geist Mono**, 10px, for camera info, project codes and measurements.
- On touch screens inputs are 16px so iOS does not zoom the page.

## Layout

- **Page.** Max width 1440px, margin 16px (24px from 768px), gutter 8px (12px). Header 64px (88px on the hero).
- **Home hero (`/`, visitors).** One screen at 1200px and wider, no scroll: the title and call to action on the left, the lens in the centre, the look cards and a second title on the right, six rings above the text and three behind it. Below 1200px the lens takes a band at the top and the text flows beneath; the rings above the text are dropped; the page scrolls.
- **Lookbook (profiles, the feed, `/:username/feed`).** A 12-column asymmetric grid, hero (8 columns, 16:9) and tall (4 columns, 4:5) frames in alternating pairs; a wide photograph takes a hero slot, a portrait a tall slot, the newest item leads. One column under 768px.
- **Explore.** A search console: one large cursive field, two tabs (Photographers, Posts), nothing pre-loaded, flat borderless rows.
- **Upload.** A glass drop zone for photos and videos (up to 10 per post), a thumbnail row, a caption, a "Photo details" panel. Loading is only the thin pink strip on the top edge.
- **Lines.** Nothing thicker than 1px except the 2px keyboard focus ring (white).

## Elevation & Depth

Depth comes from blur, not shadow. Glass blurs the gradient behind it (20px on the nav, 10–14px on cards and overlays). The only shadows are the drawer's soft offset and the drop shadow under a look card's lens. The header gets a soft blurred band on working screens so content passing under it stays clear of the pill.

## Shapes

- **Pill** (100px): the nav, every button, the logo-side controls.
- **Card** (28px): lookbook cells, 3D cells, the drop zone, the drawer, look cards.
- **Tile** (12px): avatar plates (a rounded square, never a circle), badges, thread rows.
- **Round** (50%): the mood switch, arrows, radio buttons, carousel dots, presence marks.
- **Bubble** (18px): message bubbles and shared-post cards. **Thumb** (20px): draggable photographs in Curate. **Print** (10px): the floating photographs on the home hero.

## Components

- **Header.** The logo (a lens mark and "Folio" in Galada) on the left; a glass pill of the role's destinations in the middle (the current one is a pink pill); on the right a small round swatch that switches mood, and one dark pill button, Sign out or Sign in / Join, always on screen. No Book button; booking lives on each photographer's page.
- **Buttons.** Confirmation buttons are pink with deep-green text; quiet buttons are a dark glass pill (50% black, 70% on hover). Both lift 2px on hover over 0.3s. On touch they grow to 44px.
- **Fields.** Floating-label fields with a 1px baseline that brightens on hover and draws a full-width white line on focus.
- **Lookbook cell.** The photograph at full colour with a 1.025 scale and sub-1% cursor parallax on hover, a 1px pink inner frame that fades in, and a glass overlay that glides up with camera info (or 3D model info), the credit and controls for the viewer's role. On touch the overlay is plain text under the image.
- **3D cell.** Onyx stage, low fill light plus one spotlight, constrained orbit (no pan, no zoom), arrow keys rotate, a text notice if WebGL is missing. The models are procedural stand-ins.
- **Look cards.** Two glass cards, Teal and Blue, each with a lens drawing that rises out of the top and pops (up 30px, 12° turn, 1.15 scale) on hover; the current one has a pink border; two round arrows switch too.
- **Status strip.** A full-bleed strip on the top edge, text only: pink for confirmations, glass-dark with a thin line for problems.
- **Bubbles.** Translucent circles, 10–30px, rising behind the page over 4–10s; one every 400ms on the hero, every second elsewhere. None under reduced motion.

## The hero's 3D layer

A procedural camera lens in the centre (three.js, loaded only on the home page). It orbits toward the cursor — azimuth `x × 40°`, polar `90° + y × 20°`, pointer smoothed at 0.05 per frame — and the whole picture is rolled 25°. Nine rings float around it: each bobs 15px and rocks 6° on its own period, is pushed away from the pointer inside 400px (strength 80, smoothed at 0.1, and spinning faster the closer the pointer is), and slides with parallax (front ×60, back ×−30; the four floating prints ×−15). Changing mood plays: the lens spins 360° over 0.6s (ease-in) with a growing blur (to 15px), swaps its paint at the peak, then settles at 720° over 1.5s (`back.out(0.7)`); at the same time the rings implode to the centre over 0.5s, swap shape (ring ↔ banded orb) while hidden, wait 0.3s and explode to new random places within ±100px over 0.9s (`back.out(1.5)`). The lens and rings are stand-ins drawn in code, not the soda can and cherries of the reference page.

## Do's and Don'ts

- **Do** keep text small and plain on working screens and let the work carry the colour.
- **Do** use pink only for the active state, confirmations and the frame on a hovered work; use white for focus.
- **Do** put text that must be read on a shaded or glass surface, never on the bright middle of the hero gradient (white on `#0B8A78` is 4.3:1).
- **Don't** add circular avatars, icon rows under media, spinners, hard shadows or a solid grey card.
- **Don't** claim awards, prices or numbers that are not counted from real data.
- **Don't** use jargon (EXIF, metadata, tenant, handle, poly) in anything a person reads.

## Motion

Hover and press: 0.3s ease (nav items, buttons, the lift on the call to action); look cards 0.4s on the reference page's own bounce curve `cubic-bezier(0.175, 0.885, 0.32, 1.275)` and their lens drawing on `cubic-bezier(0.34, 1.56, 0.64, 1)` (both kept as given by the brief); the lookbook's own hovers stay at 160–240ms on `cubic-bezier(0.16, 1, 0.3, 1)`. A change of workspace fades the old view out in 120ms and the new one in over 180ms. A change of mood morphs the background over 1.5s (`power2.inOut`). The lens fades in over 1.5s after a 0.3s pause and bobs 20px forever. Nothing enters from `scale(0)`. Under `prefers-reduced-motion` the pointer does nothing, the bubbles and the bobbing stop, and a change of mood is instant.
