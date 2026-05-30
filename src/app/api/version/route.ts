import { NextResponse } from "next/server";

// This endpoint returns the current app version.
// The app checks this on every load to force auto-update for ALL users.
// API calls are NOT intercepted by the Service Worker, so this always returns fresh data.

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      version: 105,
      buildTime: new Date().toISOString(),
      forceUpdate: true,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
