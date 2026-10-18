# CampusPlan — Campus Life Planner

A responsive student planner made with vanilla HTML, CSS and JavaScript ES modules.

## Run locally
1. Download/clone this repository.
2. Open the folder in VS Code.
3. Run `index.html` with the Live Server extension (ES modules work best over a local server).
4. Open `tests.html` in the same Live Server session to run the validation checks.

## Features
- Dashboard with total plans, total minutes, most-used tag and last-seven-days activity.
- Add, edit and confirm-delete planner records.
- Sort by due date, title ascending/descending and duration ascending/descending.
- Live regex search with optional case sensitivity, safe invalid-pattern handling and highlighted matches.
- Inline validation messages and duplicate-word detection.
- localStorage auto-save, validated JSON import/export and sample data reset.
- Time target with remaining/over-target announcement and minutes/hours display.
- Mobile-first layout, three responsive breakpoints, keyboard-visible focus, skip link, semantic landmarks, ARIA live regions and reduced-motion support.

## Data model
Each record contains `id`, `title`, `dueDate`, `duration`, `tag`, `details`, `createdAt` and `updatedAt`. Duration is stored in minutes.

## Regex catalog
| Purpose | Pattern | Example |
|---|---|---|
| Title has no outer spaces | `/^\\S(?:.*\\S)?$/` | `Read chapter` |
| Non-negative number | `/^(0\|[1-9]\\d*)(\\.\\d{1,2})?$/` | `45`, `12.5` |
| Date format | `/^\\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\\d\|3[01])$/` | `2026-10-14` |
| Tag format | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | `Campus Life` |
| Advanced repeated word | `/\\b(\\w+)\\s+\\1\\b/i` | `study study` |
| Search | User-provided regex compiled inside `try/catch` | `^@tag:Study` or `\\b\\d{2}:\\d{2}\\b` |

Search accepts JavaScript regex syntax. Invalid patterns display a status message instead of crashing the app. Avoid untrusted, extremely complex patterns on very large data sets.

## Keyboard map
- `Tab` / `Shift+Tab`: move through links, fields and buttons.
- `Enter` / `Space`: activate focused buttons and links.
- `Escape`: use browser-native behavior; there are no custom modal dialogs.
- The “Skip to content” link becomes visible when focused.

## Accessibility notes
- Semantic header, navigation, main, section, aside and footer landmarks.
- All form controls have labels; error and status text is announced.
- Focus rings are visible; text and controls use high-contrast colors.
- The chart has an accessible text summary; motion is reduced when requested by the OS.
- Test the full app with keyboard only and zoom the browser to check layout.

## Tests
Open `tests.html` with Live Server. It runs 10 simple assertions for title, number, date, tag, advanced regex and validation behavior.

## Deployment (GitHub Pages)
1. Create a GitHub repository that you own and keep yourself as the only contributor.
2. Add these files and commit milestones with clear messages.
3. In repository **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. Wait for deployment and copy the published URL into this README.
5. Check the live site and tests page after deployment.

## Suggested milestone commits
1. `M1: add planner specification and data model`
2. `M2: add semantic page and responsive styles`
3. `M3: add regex validation and tests`
4. `M4: add rendering sorting and regex search`
5. `M5: add dashboard stats and target`
6. `M6: add persistence and JSON backup`
7. `M7: polish accessibility and documentation`

## Before submitting
- Replace the example email and GitHub profile with your own.
- Test import/export, editing, deletion, keyboard navigation and mobile layouts.
- Record a 2–3 minute demo showing these features and regex edge cases.
- Add your actual GitHub Pages URL here: **Live demo:** TODO.

## Video Link:
https://youtu.be/uOh7Nlo0AaQ