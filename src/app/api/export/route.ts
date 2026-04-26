import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/export - Export measurements as CSV or JSON with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json"; // json or csv
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const search = searchParams.get("search");

    let where: Record<string, unknown> = {};

    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (fromDate || toDate) {
      where.createdAt = {
        ...(fromDate && { gte: new Date(fromDate) }),
        ...(toDate && { lte: new Date(toDate) }),
      };
    }

    const measurements = await db.measurement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 5000,
    });

    // Apply search filter
    let filtered = measurements;
    if (search) {
      const s = search.toLowerCase();
      filtered = measurements.filter(
        (m) =>
          m.title.toLowerCase().includes(s) ||
          m.type.toLowerCase().includes(s) ||
          m.data.toLowerCase().includes(s)
      );
    }

    // Parse JSON data strings back to objects
    const parsed = filtered.map((m) => ({
      ...m,
      data: JSON.parse(m.data),
    }));

    if (format === "csv") {
      // Generate CSV
      if (parsed.length === 0) {
        return new NextResponse("", {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": "attachment; filename=optisize-export.csv",
          },
        });
      }

      // Collect all unique data keys
      const dataKeys = new Set<string>();
      parsed.forEach((r) => {
        const d = r.data as Record<string, unknown>;
        Object.keys(d).forEach((k) => dataKeys.add(k));
      });

      const headers = [
        "id",
        "userId",
        "type",
        "title",
        "timestamp",
        ...Array.from(dataKeys),
      ];

      const rows = parsed.map((r) => {
        return headers
          .map((h) => {
            let val: unknown;
            if (h === "timestamp") {
              val = r.createdAt?.toISOString() || "";
            } else if (h in r) {
              val = (r as Record<string, unknown>)[h];
            } else if (h in (r.data as Record<string, unknown>)) {
              val = (r.data as Record<string, unknown>)[h];
            } else {
              val = "";
            }
            // Escape CSV values
            const str = String(val);
            if (str.includes(",") || str.includes('"') || str.includes("\n")) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(",");
      });

      // Add BOM for Arabic support in Excel
      const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=optisize-export.csv",
        },
      });
    }

    // Default: JSON format
    const jsonContent = JSON.stringify(parsed, null, 2);

    return new NextResponse(jsonContent, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": "attachment; filename=optisize-export.json",
      },
    });
  } catch (error) {
    console.error("GET /api/export error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
