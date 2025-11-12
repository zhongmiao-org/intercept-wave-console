# Intercept Wave Console Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning when published.

> English Changelog | [中文更新日志](./CHANGELOG.zh.md)

## [Unreleased]

### Added
- HTTP/WS "Path Suffix (optional)" now uses a dropdown (`n-select`) with filtering, clearing and free input (tag mode).
- WS "Extra Query Params" editor (`NDynamicInput`, pair preset) to add multiple key/value pairs, appended as strings to the URL.
- WS dropdown adds: `/ws/food/user`, `/ws/food/merchant`.

### Changed
- HTTP path dropdown options are generated from the preset list and de-duplicated to match upstream docs.
- WS interval field placeholder clarifies `/ws/ticker` requires this parameter.
- Auto-fill `interval=1000` when `/ws/ticker` is selected (editable).

### Removed
- Removed non-existent `/socket` from the WS path dropdown.

## [v0.1.3] - 2025-11-08

- Initial CI setup for PR lint and build
- Release draft automation on merges to main
- Publish workflow to build image and upload to GHCR
- Project scaffolding (Vite + Vue 3 + TS)
- Docker image with Nginx static hosting
- Runtime config injection via `config.js`
