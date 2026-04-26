// Storage library - localStorage based record management with database sync

export interface Record {
  id: string;
  userId: string;
  type: string;
  title: string;
  data: Record<string, unknown>;
  timestamp: string;
}

const RECORDS_KEY = "optisize-records";

export function getRecords(): Record[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(RECORDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getRecordsByUser(userId: string): Record[] {
  return getRecords().filter((r) => r.userId === userId);
}

export function getRecordsByType(type: string): Record[] {
  return getRecords().filter((r) => r.type === type);
}

export function saveRecord(record: Record): void {
  const records = getRecords();
  records.unshift(record); // Add to beginning (newest first)
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch {}
  
  // Sync to database
  syncRecordToDB(record);
}

export function deleteRecord(id: string): void {
  const records = getRecords().filter((r) => r.id !== id);
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch {}
  
  // Delete from database
  deleteRecordFromDB(id);
}

export function clearRecords(): void {
  try {
    localStorage.removeItem(RECORDS_KEY);
  } catch {}
}

export function getRecordCount(): number {
  return getRecords().length;
}

// Filter and search records
export function filterRecords(filters: {
  type?: string;
  userId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}): Record[] {
  let records = getRecords();
  
  if (filters.type) {
    records = records.filter((r) => r.type === filters.type);
  }
  
  if (filters.userId) {
    records = records.filter((r) => r.userId === filters.userId);
  }
  
  if (filters.fromDate) {
    const from = new Date(filters.fromDate).getTime();
    records = records.filter((r) => new Date(r.timestamp).getTime() >= from);
  }
  
  if (filters.toDate) {
    const to = new Date(filters.toDate).getTime();
    records = records.filter((r) => new Date(r.timestamp).getTime() <= to);
  }
  
  if (filters.search) {
    const search = filters.search.toLowerCase();
    records = records.filter(
      (r) =>
        r.title.toLowerCase().includes(search) ||
        r.type.toLowerCase().includes(search) ||
        JSON.stringify(r.data).toLowerCase().includes(search)
    );
  }
  
  return records;
}

// Export records as CSV
export function exportRecordsCSV(records: Record[]): string {
  if (records.length === 0) return "";
  
  // Collect all unique keys from data objects
  const dataKeys = new Set<string>();
  records.forEach((r) => {
    Object.keys(r.data).forEach((k) => dataKeys.add(k));
  });
  
  const headers = ["id", "userId", "type", "title", "timestamp", ...Array.from(dataKeys)];
  const rows = records.map((r) => {
    return headers.map((h) => {
      if (h in r) {
        const val = (r as Record<string, unknown>)[h];
        return `"${String(val).replace(/"/g, '""')}"`;
      }
      if (h in r.data) {
        const val = r.data[h];
        return `"${String(val).replace(/"/g, '""')}"`;
      }
      return '""';
    }).join(",");
  });
  
  return [headers.join(","), ...rows].join("\n");
}

// Export records as JSON
export function exportRecordsJSON(records: Record[]): string {
  return JSON.stringify(records, null, 2);
}

// Sync to database
async function syncRecordToDB(record: Record) {
  try {
    await fetch("/api/measurements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
  } catch {
    // Silently fail
  }
}

async function deleteRecordFromDB(id: string) {
  try {
    await fetch(`/api/measurements?id=${id}`, {
      method: "DELETE",
    });
  } catch {
    // Silently fail
  }
}
