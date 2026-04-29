---
description: "Ship: build → test → commit → push → PR"
---
1. `pnpm build` — must pass
2. `pnpm test && pnpm test:e2e` — must pass (skip e2e if none exists)
3. Show diff · wait approval · `git commit` conventional · `git push && gh pr create`
Stop on any failure — do not auto-proceed.
