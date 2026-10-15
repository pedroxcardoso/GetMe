---
version: 1.0.0
name: GETME
description: Pixel art desktop downloader for people saving media they are allowed to keep.
colors:
  primary: "#DD332A"
  background: "#000000"
  surface: "#1C1C1E"
  ink: "#F5F5F7"
  muted: "#C7C7CE"
  mint: "#27272A"
  butter: "#3A3A3C"
  lilac: "#28282B"
  sky: "#242426"
  success: "#30D158"
  danger: "#FF6961"
typography:
  display:
    fontFamily: "'Pixelify Sans', system-ui, sans-serif"
    fontSize: "37px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.7px"
  body:
    fontFamily: "'Pixelify Sans', system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  utility:
    fontFamily: "'Silkscreen', ui-monospace, monospace"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "0.4px"
rounded:
  control: "0px"
  card: "0px"
  pill: "999px"
spacing:
  unit: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  page-max: "520px"
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

GETME is a tiny pixel media player: black screen, charcoal pixel panels, bright platform marks and a little white robot with a red antenna. Its screen follows the user's supplied YouTube mockup; friendly pixel lettering carries the character while bright secondary text keeps the controls readable.

### Product context and register

- **Audience and primary job:** Portuguese-speaking desktop users saving media they own or have permission to keep.
- **Target market(s) and evidence:** Brazilian Portuguese is the requested interface language; the app is local desktop software and does not make country-specific claims.
- **Locale(s) and language policy:** Brazilian Portuguese (`pt-BR`); dates use the computer's local timezone.
- **Usage scene:** A personal, narrow portrait desktop window used to paste one link, pick an output and destination, then check progress. The layout borrows the compact rhythm and lower navigation of an iPhone app.
- **Register:** Product tool, not a promotional website.
- **Memorable signature:** A crisp-edge white robot with a red antenna, plus a six-item bottom navigation bar at phone width.
- **Restraint:** Keep the URL, format, quality and destination visually separate and easy to scan.
- **Anti-references:** Generic analytics dashboards, neon hacker utilities, browser extensions covered in gradients, and toys where pixel decoration hides the task.
- **Token ownership/runtime mapping:** The CSS custom properties in `src/styles.css` own runtime values. Frontmatter values map to `--color-*`, `--font-*`, `--radius-*` and `--layout-max`; shared screen primitives consume these tokens. No CSS token generator is configured.

## Colors

The default dark palette uses pure black (`#000000`) behind charcoal surfaces (`#1C1C1E`, `#121214`), off-white text (`#F5F5F7`) and legible secondary gray (`#C7C7CE`). GETME red (`#DD332A`) anchors the main download; blue (`#0A84FF`) marks paste/configure actions and keyboard focus on other controls, yellow flags missing tools, and green marks success. In dark mode, the URL field keeps a neutral border while it is edited; invalid links use red feedback. The user may switch to the existing light appearance; that preference remains local. Forced-colors mode retains native contrast behavior.

`src/styles.css` owns the two theme token sets; Electron `settings.json` is the durable preference source. The first launch is dark, and an explicitly saved light or dark choice survives later launches.

## Typography

Self-hosted Pixelify Sans carries body copy and headings. Silkscreen labels short utility text such as LINK, FORMATO and SALVAR EM. Both ship with the app under the SIL Open Font License; dates remain localized with `pt-BR` and paths stay legible at a compact size.

## Layout

The default desktop window is a 402×874 portrait shell, echoing the supplied narrow phone mockup. At widths below 760px, platform, history and settings navigation move to a persistent bottom bar; the GETME wordmark and saved sun/moon control stay at the top, while the provider heading starts the scrollable form. The primary download action stays above bottom navigation as the form scrolls. The screen separates URL, format, maximum quality and destination into one predictable flow.

## Elevation & Depth

Hierarchy comes from tonal separation, stepped clip-path corners and a restrained charcoal offset on larger pixel surfaces. Avoid blur and decorative gradients; keep native scrolling and the fixed lower navigation crisp.

## Shapes

Controls use stepped pixel corners instead of rounded cards. Pixel artwork and platform glyphs use square edges. Controls retain visible keyboard focus and forced-colors presentation; editing the dark-mode URL field does not add a blue focus box.

## Components

### Foundational visual states

Controls have clear default, hover, focus-visible, pressed, selected, disabled, busy, success, warning and error treatments. Inline labels explain state; color alone never carries meaning. Loading is a small spinner in a fixed location. Empty history uses a quiet mascot illustration, not a loading skeleton.

### Buttons and actions

The single primary action is a full-width red pixel button with white text. Paste and setup actions use high-contrast blue. Folder and utility actions are charcoal outlined buttons. Danger is reserved for visibly labeled removal actions. Busy buttons preserve their dimensions and show a spinner with text.

### Navigation and data display

Platform destinations keep their pixel glyph beside a visible name or fixed short tab label. The active item uses platform color and clear text. History stays a compact list with provider, format, date and explicit file actions; it does not become an unbounded dashboard table.

### Forms and overlays

Fields use a charcoal surface and bright text. The dark-mode URL field stays neutral while focused, with invalid-link feedback shown in red; other controls keep a visible keyboard focus state. Format and quality are semantic buttons with `aria-pressed`, not custom listboxes. Folder and executable selection use the operating-system file picker.

### Iconography

Small interface icons use Lucide outline strokes. Platform symbols are blocky pixel glyphs; a readable provider label remains beside each navigation icon. The robot is local crisp-edge SVG and Windows ICO with `shape-rendering: crispEdges`.

The Instagram camera is drawn as blocky pixel rectangles in its recognizable pink-purple-orange mosaic; the app-wide appearance control switches between pixel sun and moon icons.

### Motion

Interactive surfaces lift by one pixel on hover and settle in 120–180ms. Progress is the only continuous motion. `prefers-reduced-motion` removes lifts and looping animation while preserving immediate progress updates.

### Content and data visualization

Use short Brazilian Portuguese sentences, sentence case and direct verbs. Progress includes a visible bar and text such as percent, speed or remaining time when available. No chart palette is needed in the first version.

## Do's and Don'ts

- **Do:** Keep link validation and progress adjacent to the field or job they describe.
- **Do:** Keep platform identity recognizable while using the same control layout on all provider screens.
- **Don't:** Use remote thumbnails, remotely fetched fonts, remote scripts or automatic analytics.
- **Don't:** Let pixel decoration obscure URL, quality, destination or error text.
