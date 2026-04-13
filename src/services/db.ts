import Dexie, { type Table } from 'dexie';

export interface Project {
  id?: number;
  name: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export interface DetectionRecord {
  id?: number;
  timestamp: string;
  project_name: string;
  project_id: number | null;
  count_result: number;
  image_uri: string;
  notes: string;
  rebar_diameter: number;
  rebar_grade: string;
}

export interface DailyStats {
  date: string;
  total_count: number;
  record_count: number;
}

export interface ProjectStats {
  project_name: string;
  total_rebars: number;
  session_count: number;
  avg_per_session: number;
}

class RebarDB extends Dexie {
  projects!: Table<Project, number>;
  records!: Table<DetectionRecord, number>;

  constructor() {
    super('RebarCounter');
    this.version(1).stores({
      projects: '++id, name, updated_at',
      records: '++id, project_id, timestamp',
    });
  }
}

const db = new RebarDB();

export async function saveRecord(
  count_result: number,
  image_uri: string,
  project_name: string = '',
  project_id: number | null = null,
  notes: string = '',
  rebar_diameter: number = 0,
  rebar_grade: string = ''
): Promise<number> {
  const timestamp = new Date().toISOString();
  const id = await db.records.add({
    timestamp,
    project_name,
    project_id,
    count_result,
    image_uri,
    notes,
    rebar_diameter,
    rebar_grade,
  });
  if (project_id != null) {
    await db.projects.update(project_id, { updated_at: timestamp });
  }
  return id as number;
}

export async function getAllRecords(): Promise<DetectionRecord[]> {
  return db.records.orderBy('timestamp').reverse().toArray();
}

export async function getRecentRecords(limit: number = 5): Promise<DetectionRecord[]> {
  return db.records.orderBy('timestamp').reverse().limit(limit).toArray();
}

export async function getRecordsByProject(projectId: number): Promise<DetectionRecord[]> {
  return db.records.where('project_id').equals(projectId).reverse().sortBy('timestamp');
}

export async function getRecordsByDateRange(start: string, end: string): Promise<DetectionRecord[]> {
  return db.records
    .where('timestamp')
    .between(start, end, true, true)
    .reverse()
    .sortBy('timestamp');
}

export async function searchRecords(query: string): Promise<DetectionRecord[]> {
  const q = query.toLowerCase();
  return db.records
    .filter(r =>
      r.project_name.toLowerCase().includes(q) ||
      r.notes.toLowerCase().includes(q)
    )
    .reverse()
    .sortBy('timestamp');
}

export async function getRecordById(id: number): Promise<DetectionRecord | undefined> {
  return db.records.get(id);
}

export async function deleteRecord(id: number): Promise<void> {
  await db.records.delete(id);
}

export async function deleteAllRecords(): Promise<void> {
  await db.records.clear();
}

export async function getRecordCount(): Promise<number> {
  return db.records.count();
}

export async function getTotalRebarCount(): Promise<number> {
  const records = await db.records.toArray();
  return records.reduce((sum, r) => sum + r.count_result, 0);
}

export async function getAverageCount(): Promise<number> {
  const records = await db.records.toArray();
  if (records.length === 0) return 0;
  const total = records.reduce((sum, r) => sum + r.count_result, 0);
  return Math.round(total / records.length);
}

export async function getDailyStats(days: number = 7): Promise<DailyStats[]> {
  const safeDays = Math.max(1, Math.floor(days));
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - safeDays);
  const cutoffISO = cutoff.toISOString();

  const records = await db.records
    .where('timestamp')
    .aboveOrEqual(cutoffISO)
    .toArray();

  const grouped: Record<string, { total_count: number; record_count: number }> = {};
  for (const r of records) {
    const date = r.timestamp.slice(0, 10);
    if (!grouped[date]) {
      grouped[date] = { total_count: 0, record_count: 0 };
    }
    grouped[date].total_count += r.count_result;
    grouped[date].record_count += 1;
  }

  return Object.entries(grouped)
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getProjectStats(): Promise<ProjectStats[]> {
  const records = await db.records.toArray();
  const grouped: Record<string, { total_rebars: number; session_count: number; counts: number[] }> = {};

  for (const r of records) {
    const name = r.project_name || 'Unassigned';
    if (!grouped[name]) {
      grouped[name] = { total_rebars: 0, session_count: 0, counts: [] };
    }
    grouped[name].total_rebars += r.count_result;
    grouped[name].session_count += 1;
    grouped[name].counts.push(r.count_result);
  }

  return Object.entries(grouped)
    .map(([project_name, g]) => ({
      project_name,
      total_rebars: g.total_rebars,
      session_count: g.session_count,
      avg_per_session: Math.round(g.total_rebars / g.session_count),
    }))
    .sort((a, b) => b.total_rebars - a.total_rebars);
}

export async function createProject(name: string, location: string = ''): Promise<number> {
  const now = new Date().toISOString();
  return db.projects.add({ name, location, created_at: now, updated_at: now }) as Promise<number>;
}

export async function getAllProjects(): Promise<(Project & { record_count: number })[]> {
  const projects = await db.projects.orderBy('updated_at').reverse().toArray();
  const allRecords = await db.records.toArray();
  return projects.map(p => {
    const count = allRecords.filter(r => r.project_id === p.id).length;
    return { ...p, record_count: count };
  });
}

export async function deleteProject(id: number): Promise<void> {
  await db.projects.delete(id);
}

export async function exportRecordsAsCSV(): Promise<string> {
  const records = await getAllRecords();
  const esc = (val: string) => `"${val.replace(/"/g, '""')}"`;
  const header = 'ID,Timestamp,Project,Count,Rebar Diameter,Rebar Grade,Notes';
  const rows = records.map(r =>
    `${r.id},${esc(r.timestamp)},${esc(r.project_name)},${r.count_result},${r.rebar_diameter},${esc(r.rebar_grade)},${esc(r.notes)}`
  );
  return [header, ...rows].join('\n');
}
