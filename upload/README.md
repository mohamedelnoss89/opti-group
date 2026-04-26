# OptiSize — PROJECT ALREADY BUILT! READ THIS FIRST!

## ⚠️ DO NOT START FROM SCRATCH!

**This project is fully built at `/home/z/my-project/`!**

Read `/home/z/my-project/worklog.md` for complete development history and all details.

## Quick Summary:

**OptiSize** = تطبيق عربي لصحة العين (Eye Health App) - NOT an image resizer or clothing size tool!

- **Path**: `/home/z/my-project/`
- **Tech**: Next.js 16, TypeScript, Tailwind CSS 4, framer-motion
- **Theme**: Dark (#0a0e1a), cyan (#00f0ff), Arabic RTL
- **Build**: `cd /home/z/my-project && npx next build --turbopack`
- **Start**: `cd /home/z/my-project && PORT=3000 node .next/standalone/server.js`
- **Copy assets after build**: `cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/`

## Features:
1. PD Scanner (camera-based pupillary distance measurement)
2. Vision Tests (Visual Acuity, Ishihara Color Vision, Astigmatism)
3. Eye Health Center (Strabismus, Cataract, Glaucoma screening)
4. Glasses Catalog (68 glasses, 5 categories, filters, search)
5. Virtual Try-On (camera + drag glasses overlay + download)
6. Records (saved test results)
7. i18n (Arabic/English toggle)

## Key Files:
- `src/app/page.tsx` — Main orchestrator
- `src/components/optisize/` — 21 components
- `src/lib/i18n.ts` — i18n translations
- `public/glasses/` — 70 glasses images
- `public/favicon.svg` — Custom eye favicon
- `.next/standalone/index.js` — FC handler wrapper

## Pending:
- Redesign VisionTest for multi-step flow (right eye → save → left eye → save → final)
- Verify Scanner capture + GlassesTryOn auto-capture
