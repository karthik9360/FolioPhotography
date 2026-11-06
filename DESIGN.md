---
name: Folio (working title)
description: A photographer platform set like a fashion monograph on warm linen — the work first, small type as architecture, a muted gold line for what is active.
colors:
  paper: "#F5F5F0"
  paper-bright: "#F0EDE6"
  photo-wash: "#EAE7E0"
  ink: "#1F1F1E"
  ink-soft: "#66635D"
  hairline: "#D9D4C8"
  signal: "#C5A880"
  accent-2: "#8C927D"
  on-accent: "#1F1F1E"
  scrollbar: "#BDB7AA"
  darkroom: "#0A0A0A"
  darkroom-text: "#F5F5F0"
  darkroom-dim: "#B4B3AD"
  dark-paper: "#0A0A0A"
  dark-paper-bright: "#141413"
  dark-photo-wash: "#161615"
  dark-ink: "#F5F5F5"
  dark-ink-soft: "#8A8A85"
  dark-hairline: "#2A2A28"
  watermark-shade: "rgba(0, 0, 0, 0.35)"
  watermark-light: "rgba(255, 255, 255, 0.8)"
typography:
  display:
    fontFamily: "Bodoni Moda Variable, Didot, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.14em"
  headline:
    fontFamily: "Bodoni Moda Variable, Didot, serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "0.12em"
  wordmark:
    fontFamily: "Bodoni Moda Variable, Didot, serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.32em"
  title:
    fontFamily: "Bodoni Moda Variable, Didot, serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "0.01em"
  search:
    fontFamily: "Bodoni Moda Variable, Didot, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0.06em"
  body:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0em"
  caption:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "0.01em"
  label:
    fontFamily: "Archivo Variable, Arial Narrow, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.14em"
  field:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0em"
  data:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.625rem"
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
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.none}"
    height: "32px"
    padding: "0 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent-2}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    height: "32px"
    padding: "0 16px"
  input-field:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    height: "40px"
    padding: "0 0"
  drop-zone:
    backgroundColor: "{colors.photo-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "24px 16px"
  lightbox-panel:
    backgroundColor: "{colors.darkroom}"
    textColor: "{colors.darkroom-text}"
---

# Design System: Folio (working title)

## Overview

**North star: "The Monograph, in small type."** The platform reads like a printed photography monograph on warm linen that happens to be interactive. The work leads; the interface is quiet, compact and written in everyday words. Social features exist but are set as plain text actions (Like, Comment, Share, Save), never an icon row.

- **Mode by surface.** The lookbook, profiles and 3D cells are *Experience*: the artifact leads and the interface recedes. Upload, settings, billing and review are *Operate*: clarity and clear states come first.
- **Density.** Compact. Headers never exceed 16px, secondary text is 10–11px, spacing steps are 8–32px. Whitespace separates; thin lines are rare.
- **Language.** No jargon in anything a person reads: "Photo details", "Camera info", "Username", "Sign in / Join", "Photographers", "Posts". Errors say what happened and what to do, with no codes.
- **Not an Instagram clone.** No circular avatars, no uniform square grids, no icon rows under media, no floating status chips, no bottom toolbars, no centre spinners.

## Colors

Two looks, one switch (`data-theme` on `<html>`, remembered in the browser, applied before first paint). **Warm linen is the default; Dark is the option.**

- **Paper** (`#F5F5F0`): the base, bone-white linen. **Paper bright** (`#F0EDE6`): panels and sheets, muted ivory. **Photo wash** (`#EAE7E0`): champagne taupe for placeholders and the upload drop zone.
- **Ink** (`#1F1F1E`): soft obsidian charcoal for text and headings. **Ink soft** (`#66635D`): warm grey for secondary text, at least 4.8:1 on every surface.
- **Hairline** (`#D9D4C8`): very thin lines.
- **Signal, muted gold** (`#C5A880`): active menu underlines, the loading strip, confirmation buttons (with charcoal text, about 7:1), the thin frame on a hovered work, the status strip. **Accent 2, olive** (`#8C927D`): the hover shift on confirmation buttons, online marks, approvals, unsaved marks. Gold is about 2:1 on linen, so it **never carries meaning alone and is never text on a light surface**; keyboard focus rings are charcoal.
- **Dark** swaps paper to `#0A0A0A`, ink to `#F5F5F5`, ink soft to `#8A8A85` and keeps the same gold and olive. The 3D stage and the full-screen viewer are always onyx.
- Every text pair is at least 4.5:1 (3:1 for large text); the test suite scans every visible text element in both looks.

## Typography

- **Headers: Bodoni Moda (optical-size build).** `display` 1rem and `headline` 0.875rem, uppercase, open tracking, never larger. Titles on cells are 0.875rem sentence case. The Explore search field is 1rem.
- **Interface and body: Hanken Grotesk.** Body 12px (`text-xs`), captions and fields 11px, form messages 10px.
- **Labels and indicators: Archivo at 75% width.** 11px, uppercase, tracking 0.14em.
- **Data: Geist Mono**, 10px, for camera info, project codes and measurements.
- **The scale has a ceiling:** Tailwind's `text-xl` and larger all resolve to 1rem; `text-compact` (11px) and `text-micro` (10px) are added. On touch screens inputs are 16px so iOS does not zoom the page.

## Layout

- **Page.** Max width 1440px, margin 16px (24px from 768px), gutter 8px (12px). Header 48px. Vertical steps 8–32px; page top padding at most 32px.
- **Lookbook (profiles, the feed, `/:username/feed`).** A 12-column asymmetric grid, hero and tall frames in alternating pairs. Hero spans 8 columns at 16:9; tall spans 4 at 4:5. A wide photograph takes a hero slot, a portrait a tall slot; the newest item always leads. Under 768px it is one column. A cell is the work, then a text block: title, project code, category.
- **Explore.** A search console, not a grid: one borderless text field, two tabs (Photographers, Posts), nothing pre-loaded, flat borderless result rows.
- **Upload.** A borderless champagne drop zone for photos and videos (up to 10 per post), a thumbnail row, a caption, a "Photo details" panel. Loading is only the thin gold strip on the top edge.
- **Lines.** Nothing thicker than 1px except the 2px keyboard focus ring.

## Elevation & Depth

Flat. No card shadows. The only shadow is the drawer's soft offset. A hovered work gains a 1px gold inner frame and a bottom overlay that glides up.

## Shapes

Square everywhere: no border radius (`rounded.none`). Avatars are square monogram plates. `rounded.full` is used only for small controls and marks, never a person or a photograph: radio buttons, carousel dots and the proof status mark.

## Components

- **Buttons.** Confirmation buttons are gold with charcoal text, 32px high, shifting to olive on hover; quiet buttons are a thin charcoal outline. On touch they grow to 44px.
- **Fields.** Floating-label fields with a 1px baseline that darkens on hover and draws a full-width charcoal line on focus; 160ms.
- **Lookbook cell.** The photograph (or a WebGL canvas for a `type: '3d'` node), a warm tint at rest that lifts on hover, a 1.025 scale, a sub-1% cursor parallax, and an overlay with camera info (or 3D model info), the credit and controls for the viewer's role: View, Share, Follow, Book; a private note for a photographer on their own work; Approve / Ask for changes / Hold for a client. On touch the overlay is plain text under the image.
- **3D cell.** Onyx stage, low fill light plus one spotlight, constrained orbit (no pan, no zoom, capped angles), arrow keys rotate, a text notice if WebGL is missing. The models are procedural stand-ins.
- **Status strip.** A full-bleed strip on the top edge, text only: gold for confirmations, ivory with a thin line for problems.
- **Avatars.** Small square monogram plates, never circles.
- **Header.** Role-based links, Sign out or Sign in / Join always on screen, no Book button (booking lives on each photographer's page).

## Do's and Don'ts

- **Do** keep every header at or under 16px, every input and label at 10–11px, and write in everyday words.
- **Do** use gold only for lines, strips and confirmation buttons; use charcoal for focus.
- **Don't** add icons under media, circular avatars, floating panels, spinners, gradients, or text above a heading as a kicker.
- **Don't** use jargon (EXIF, metadata, tenant, handle, poly) in anything a person reads.

## Motion

One curve: `cubic-bezier(0.16, 1, 0.3, 1)`. Everything is under 200ms: hover lifts 160–240ms (photo 240ms, overlay 170ms, frame and fields 160ms); a change of workspace fades the old view out in 120ms (sliding 24px left) and the new one in over 180ms; the status strip 180ms. Nothing enters from `scale(0)`. Under `prefers-reduced-motion` cursor tracking does nothing.
