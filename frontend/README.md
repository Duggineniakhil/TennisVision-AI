# Frontend — PadelVision

Next.js 16 frontend for the PadelVision Padel video analysis platform.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Runtime:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + custom CSS
- **Icons:** Lucide React

## Scripts

```bash
npm install
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint
```

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout with Navbar
│   ├── page.tsx                # Home — upload UI + SaaS feature cards
│   ├── globals.css             # Global styles + custom scrollbar + glass effects
│   └── analysis/[id]/page.tsx  # Analysis dashboard
│
├── components/
│   ├── Navbar.tsx              # Top navigation bar
│   ├── Sidebar.tsx             # Left tab navigation
│   ├── BreadcrumbHeader.tsx    # Breadcrumb header
│   ├── Uploader.tsx            # Drag-and-drop video upload
│   ├── StatusPoller.tsx        # Polls /api/status/{id} for progress
│   ├── VideoPlayer.tsx         # Custom HTML5 video player
│   ├── StatsPanel.tsx          # Head-to-head player stats
│   ├── HeatmapView.tsx         # Player heatmap display
│   ├── ShotMap.tsx             # Ball shot map display
│   └── HighlightTimeline.tsx   # Clickable highlight list
│
└── lib/
    └── api.ts                  # API helpers: uploadVideo, getStatus, getAnalysis
```

## Environment

No environment variables are required for local development. The API base URL is hardcoded to `/api` in `lib/api.ts`, which proxies to the FastAPI backend running on port 8000.

## Conventions

- All interactive components are client components (`"use client"`).
- Tailwind v4 arbitrary values are used extensively for the dark SaaS theme (`bg-[#0A0F1D]`, `text-[#D0FF41]`, etc.).
- State management is local React `useState` — no global state library.
- The `StatusPoller` component manages the loading → done → error lifecycle for the analysis page.
