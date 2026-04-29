---
name: ui-builder
description: "React components: shadcn/ui + Tailwind. Responsive, accessible."
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
---
Scope: src/components/ · page markup in src/app/**/page.tsx
Not scope: server actions · API routes · DB logic

1. shadcn/ui primitives first — check src/components/ui/ before building new
2. Tailwind only · tokens in src/app/globals.css — no inline styles
3. Mobile-first 375px → up · dark: variants by default
4. Always: loading + error + empty states
5. Accessibility: semantic HTML · ARIA · keyboard navigation
