---
Task ID: 1
Agent: Main Agent
Task: Fix OptiSize app - was broken/not working on mobile

Work Log:
- Investigated why the app was broken: Next.js server was not running (port 3000 not listening)
- Found subscription system was using in-memory storage (lost on server restart)
- Fixed subscription route to use Prisma database for persistent storage
- Added SubscriptionActivation model to support multi-user codes (e.g., SIZE2026 maxUsers=3)
- Rebuilt the Next.js app (production build)
- Started the production server with persistent process (detach-start.sh with auto-restart)
- Verified Caddy proxy (port 81) correctly forwards to Next.js (port 3000)
- Cleaned up all test data and reset all subscription codes for production use
- All 14 built-in codes are now available: SIZE2026, OPTI2026, EYES2026 (master), OPTA7X9K-OPTF9H3J (normal), GIFTA1B2-GIFTM3N4 (gift)

Stage Summary:
- App server is now running and accessible on port 3000 (direct) and port 81 (via Caddy)
- Subscription system now uses database (Prisma/SQLite) instead of in-memory
- Multi-user code support added via SubscriptionActivation table
- All API endpoints verified working: health check, subscription status, code activation
- Key files modified: src/app/api/subscriptions/route.ts, prisma/schema.prisma
- Server auto-restarts via detach-start.sh (while loop with 3s delay)
