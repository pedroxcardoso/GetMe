# GETME UX contract

This contract owns workflow, navigation, feedback and recovery for the desktop app. Visual values live in [DESIGN.md](DESIGN.md); CSS variables in `src/styles.css` are the runtime token source.

## Canonical UI map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Form | Shared provider form in `src/App.tsx` | This contract | YouTube (MP4/MP3), other providers (MP4) | Typecheck, build and manual form-state review |
| Format and quality choice | `SelectionCard` and `.quality-choice` | This contract and `DESIGN.md` | Selected / unselected, provider-supported choices | Keyboard and `aria-pressed` review |
| Scrollbar | Global rules in `src/styles.css` | `DESIGN.md` | Default scroll surface | Standards property and forced-colors review |
| Folder picker | Electron main-process picker via `window.getme.chooseDownloadFolder` | This contract | Downloads default / user-selected directory | IPC boundary and folder-state review |
| Tool picker | `ToolCard` and Electron main-process executable picker | This contract | yt-dlp / FFmpeg | IPC boundary and missing/ready state review |
| Installer engine setup | Optional NSIS checkbox and bundled setup script | This contract | Download both engines / configure later | Checksum verification and automatic discovery review |
| History search | History toolbar in `src/App.tsx` | This contract | All providers / one provider | Clear action and empty/no-results state review |
| Feedback | Inline `StatusLine`, job row and field feedback | This contract | Success / warning / error / progress | Semantic text and live-region review |
| Appearance | Shared pixel sun/moon toggle in the top bar; Electron settings file | This contract | Light / dark, persisted locally | Restart and contrast-state review |

## Navigation and ownership

- The persistent navigation has four provider destinations (YouTube, X, Instagram, TikTok), plus Histórico and Configurações. In the phone-shaped portrait window, all six destinations remain visible in a bottom tab bar.
- Each provider screen owns one URL form. The selected provider and supported domains must agree before a download can start.
- YouTube offers MP4 or MP3 and a resolution choice. X, Instagram and TikTok offer MP4 and a resolution choice.
- Provider navigation is a set of ordinary buttons, not an ARIA tab widget. On narrow windows, the same items move into a fixed bottom navigation bar with safe-area spacing and persistent labels.
- The 402×874 default window uses the operating-system title bar. Its Windows title-bar and installer icon use the GETME robot. Electron main owns file-system, process and shell operations; the renderer can call only the narrow methods in `electron/preload.cjs`.
- The local history records only successful downloads. Removing a history row never deletes the downloaded file.

## Download behavior

| Operation | Trigger | Pending | Success | Failure and recovery |
|---|---|---|---|---|
| Choose URL | Paste into the labeled URL field | Preserve typed URL | Keep it on the same provider screen | Inline URL guidance; preserve input |
| Start download | “Baixar” | Disable duplicate submit; show a stable progress row with percent/speed/ETA where available | Mark complete, save history and offer “Abrir arquivo” | Show actionable job error and keep retry/cancel controls available |
| Cancel download | “Cancelar” on an active row | Keep progress row and announce cancellation | Mark cancelled; do not create a success history entry | Keep the job visible with an error if the process could not stop |
| Choose folder | “Trocar pasta” in the download form or settings | Use the OS directory picker | Persist selection locally and update the destination label | Keep the previous folder and show inline feedback |
| Remove history row | Row action | No file-system mutation | Remove that record only | Preserve other history entries |

## Validation and platform limits

- Forms use `noValidate`; validate URL, supported HTTPS host, required fields, selected format and resolution before IPC.
- The main process repeats validation. It invokes a fixed executable with an argument array and never passes the URL through a shell.
- The app disables playlists and does not read browser cookies or sign-in credentials.
- yt-dlp support is best-effort and can break when a platform changes its site. Platform login walls, private content, rate limits and regional restrictions are not bypassed.
- MP3 conversion and MP4 remuxing require FFmpeg. The Windows installer can optionally download yt-dlp and FFmpeg Essentials, verify their SHA-256 checksums, and place them under `%APPDATA%\pipoca-pixel-downloader\tools`; the main process discovers those executables automatically. If setup is skipped or fails, Settings offers manual selection and setup links. A download never starts without the needed executables.
- Use only content you own or have permission to save. The app does not send URLs, files or history to an app-operated service.

## Local data and recovery

- Settings and successful-download history live in Electron `userData` as local JSON. The V1 GETME rebrand reuses the prior Pipoca `userData` directory to preserve local settings and history. The destination defaults to the operating-system Downloads folder.
- The dark pixel-art appearance is the first-launch default. The selected light or dark appearance is saved in `settings.json` in the same local settings folder and restored at app start.
- History is bounded to the newest 100 successful items. The app stores file paths as records and never silently removes files from disk.
- A failed or cancelled job stays visible during the app session and can be retried from its provider screen.
- The renderer shows loading, missing-tool, ready, progress, success, failure and empty-history states. Error messages translate common extractor and missing-tool failures and do not expose a raw stack trace.

## Feedback, locale and accessibility

- UI locale is `pt-BR`; dates and times use the computer's local timezone.
- A single action keeps the same verb through its pending and success states. Progress and completion use text as well as color and announce via `role="status"` / `aria-live="polite"`.
- Controls have visible labels, keyboard support, focus-visible styles and stable dimensions while busy. Use `type="button"` for non-submit actions and semantic `<button>` elements.
- Link forms use field-level help and inline errors; the form owns validation rather than browser bubbles. Search filters local history immediately and has an explicit clear action.
- Respect reduced motion. Scrollbar colors and geometry are set globally, with forced-colors fallback.
