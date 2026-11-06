---
version: 1
slug: "src-pages-portfoliopage-jsx"
primary_target: "src/pages/PortfolioPage.jsx"
related_targets: ["src/pages/ProfilePage.jsx","src/components/booking/BookingDrawer.jsx","src/components/gallery/PhotoViewer.jsx"]
---

# Folio: portfolio, profile, booking

## Scope and mode
Three routes of one platform. `/` Portfolio is Experience (the artifact leads). `/profile/:handle` is Read/Experience (editorial masthead, then a grid). The booking drawer and lightbox are Operate (clear states over expression). The direction was pinned by the owner's brief; the concept roll was not run.

## Audience, job, proof, constraints
Visitors judging a photographer's work, then following, saving, commenting, or booking. No real photographs, people, counts, or prices exist; all content is synthetic and labelled. Stack: React + Vite + Tailwind. Undecided: backend, auth, product name, currency.

## Direction contract

THESIS: A photographer platform set like a printed monograph. The photograph is the largest, highest-contrast thing on every screen; social features are typeset as publication furniture. It refuses the feed-app look: dense cards, always-on counters, chrome competing with images.

OWN-WORLD: Cool off-white paper (#F2F2EF), ink (#0D0D0C), one flat ultramarine signal (#0B2FD0) spent only on state and focus. Bodoni Moda for names and titles (upright, never italic), Hanken Grotesk for interface, Geist Mono only for EXIF and amounts. Square corners; round only for avatar and radios. Print crop marks drawn outside a photograph's trim edge on hover. A darkroom-black lightbox. No cards, gradients, glass, or glow.

STORY: The visitor sees the work first, trusts the credits and captions, and can follow, save, comment, and book a shoot without losing their place.

FIRST VIEWPORT: Sticky 64px header with wordmark left and "Book a shoot" top right. Below it the photographer's name at display size, left-aligned on a 12-column grid, with the bio and category filter sharing one baseline beneath. The masonry begins inside the first screen so a photograph is visible without scrolling.

FORM: Editorial masonry plus a profile masthead. Position: pinned by the brief, not drawn from a ranked list. seed: none (unavailable)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
Real photography and a real name replace the stand-ins. Mood boards (currently one local save list), real date picker, and a backend are not built.
