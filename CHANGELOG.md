# Changelog

## v.0.1.2 — 2026-09-28

### Changed
- Upstream Railway updates now open a review PR, including description changes, instead of committing directly or opening an issue.

## v.0.1.1 — 2026-09-28

### Changed
- Clarified Railway signup guidance: use `railway up` to sign up and deploy an app, or `railway login` when only an account is needed.

## v.0.1.0 — 2026-09-28

### Added
- Published the `use-railway` skill with Railway's upstream references and scripts.
- Added a daily 09:00 UK-time upstream sync, with manual review and an issue notification when Railway's description changes.

### Fixed
- Count the skill description limit in characters rather than UTF-8 bytes, allowing the existing 1,024-character description to sync.
