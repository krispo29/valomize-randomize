## 2025-01-26 - Large Base64 Assets in Data Files
**Learning:** The codebase contained large base64-encoded images directly embedded in `src/data/valorant.ts`, significantly bloating the initial bundle size and parsing time.
**Action:** Always check data files for embedded assets and move them to `public/` to be served as static resources, referencing them by URL instead.
