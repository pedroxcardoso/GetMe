---
version: 1.0.0
name: GETME
description: Pixel art desktop downloader for people saving media they are allowed to keep.
colors:
  primary: "#F39ABB"
  background: "#FFF4F8"
  surface: "#FFFAFD"
  ink: "#382B43"
  muted: "#766978"
  mint: "#F6DCE8"
  butter: "#FFE29A"
  lilac: "#E6D2F6"
  sky: "#D5E9F5"
  success: "#38775E"
  danger: "#B54E5A"
typography:
  display:
    fontFamily: "'Trebuchet MS', system-ui, sans-serif"
    fontSize: "31px"
    fontWeight: 850
    lineHeight: 1.15
    letterSpacing: "-1.2px"
  body:
    fontFamily: "'Trebuchet MS', system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  utility:
    fontFamily: "'Courier New', ui-monospace, monospace"
    fontSize: "9px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0.2px"
rounded:
  control: "4px"
  card: "6px"
  pill: "999px"
spacing:
  unit: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  page-max: "1120px"
components:
  app-shell:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.xl}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "46px"
    padding: "{spacing.lg}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "34px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
  utility-label:
    backgroundColor: "{colors.background}"
    textColor: "{colors.muted}"
    typography: "{typography.utility}"
  selection-mint:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
  selection-butter:
    backgroundColor: "{colors.butter}"
    textColor: "{colors.ink}"
  provider-lilac:
    backgroundColor: "{colors.lilac}"
    textColor: "{colors.ink}"
  provider-sky:
    backgroundColor: "{colors.sky}"
    textColor: "{colors.ink}"
  status-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.surface}"
  status-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.surface}"
  metadata:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
---

# GETME visual direction

## Overview

### Creative North Star

GETME feels like a tiny pastel media player tucked into a pink phone-shaped shell. A pixel cat with a bow is the signature; soft rose surfaces, plum ink and a butter-yellow spark make the app feel sweet while keeping links, settings and download status easy to scan.

### Product context and register

- **Audience and primary job:** Portuguese-speaking desktop users saving media they own or have permission to keep.
- **Target market(s) and evidence:** Brazilian Portuguese is the requested interface language; the app is local desktop software and does not make country-specific claims.
- **Locale(s) and language policy:** Brazilian Portuguese (`pt-BR`); dates use the computer's local timezone.
- **Usage scene:** A personal, narrow portrait desktop window used to paste one link, pick an output and destination, then check progress. The layout borrows the compact rhythm and lower navigation of an iPhone app.
- **Register:** Product tool, not a promotional website.
- **Memorable signature:** A crisp-edge pixel cat mascot with a pink bow, plus a six-item bottom navigation bar at phone width.
- **Restraint:** Keep the URL, format, quality and destination visually separate and easy to scan.
- **Anti-references:** Generic analytics dashboards, neon hacker utilities, browser extensions covered in gradients, and toys where pixel decoration hides the task.
- **Token ownership/runtime mapping:** The CSS custom properties in `src/styles.css` own runtime values. Frontmatter values map to `--color-*`, `--font-*`, `--radius-*` and `--layout-max`; shared screen primitives consume these tokens. No CSS token generator is configured.

## Colors

The palette uses a blush-tinted paper background, near-white rose surface, plum ink and a candy-pink primary action. Rose marks selection and focus; butter marks progress and quality. Lilac and sky identify secondary platform context. Success and danger retain semantic color and pair with words and icons. The product ships in a light theme and retains system behavior in forced-colors mode.

The dark theme keeps the pink-and-plum identity on a deep plum canvas, with rose borders and warm moonlight yellow. `src/styles.css` owns both theme token sets; Electron `settings.json` is the durable preference source.

## Typography

Body copy and display headings use Trebuchet MS with a system sans-serif fallback. Short branding and compact technical labels use Courier New with a monospace fallback; long instructions never use the pixel-style utility face. Dates use the `pt-BR` locale formatter, while paths and progress metadata use stable monospace figures.

## Layout

The default desktop window is a 402×874 portrait shell, echoing a modern phone ratio. At widths below 760px, platform, history and settings navigation move to a persistent bottom bar; the title stays compact at the top and the main content scrolls above the safe-area inset. The screen separates URL, output choice, quality and destination into one predictable form. A 4px spacing unit supports an 8/12/16/24px rhythm. Progress rows reserve their bar and metadata space before values arrive.

## Elevation & Depth

Hierarchy comes from a firm two-pixel ink border and a short, hard offset shadow rather than blur. Static surfaces use one shadow; pressed actions move down and reduce it. Avoid translucent glass, stacked shadows and decorative blur.

## Shapes

Controls use small corners on desktop; the portrait shell rounds cards and touch controls more generously (10–18px) to echo iOS. Small badges are circular or pill-shaped only when their number or status is the content. Pixel artwork and provider glyphs use square edges. Borders remain visible around keyboard focus and forced-colors presentation.

## Components

### Foundational visual states

Controls have clear default, hover, focus-visible, pressed, selected, disabled, busy, success, warning and error treatments. Inline labels explain state; color alone never carries meaning. Loading is a small spinner in a fixed location. Empty history uses a quiet mascot illustration, not a loading skeleton.

### Buttons and actions

The single primary action is candy pink with a dark outline and short hard shadow. Folder and utility actions are quiet outlined buttons. Danger is reserved for visibly labeled removal actions. Busy buttons preserve their dimensions and show a spinner with text.

### Navigation and data display

Platform destinations keep their branded glyph beside a visible name. The active item adds an ink outline and small offset shadow. History stays a compact list with provider, format, date and explicit file actions; it does not become an unbounded dashboard table.

### Forms and overlays

Fields use a white surface, an ink border and a mint focus ring. Validation appears beside the URL field with preserved input. Format and quality are semantic buttons with `aria-pressed`, not custom listboxes. Folder and executable selection use the operating-system file picker.

### Iconography

Small interface icons use Lucide outline strokes. Platform symbols are simple color glyphs; a readable provider label remains beside each navigation icon. The mascot is local crisp-edge SVG with `shape-rendering: crispEdges`.

The Instagram camera is drawn as blocky pixel rectangles in a small pink-purple-orange mosaic; the app-wide appearance control switches between pixel sun and moon icons.

### Motion

Interactive surfaces lift by one pixel on hover and settle in 120–180ms. Progress is the only continuous motion. `prefers-reduced-motion` removes lifts and looping animation while preserving immediate progress updates.

### Content and data visualization

Use short Brazilian Portuguese sentences, sentence case and direct verbs. Progress includes a visible bar and text such as percent, speed or remaining time when available. No chart palette is needed in the first version.

## Do's and Don'ts

- **Do:** Keep link validation and progress adjacent to the field or job they describe.
- **Do:** Keep platform identity recognizable while using the same control layout on all provider screens.
- **Don't:** Use remote thumbnails, third-party fonts, remote scripts or automatic analytics.
- **Don't:** Let pixel decoration obscure URL, quality, destination or error text.
