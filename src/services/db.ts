import * as SQLite from 'expo-sqlite';

// --- Types ---

export interface Record {
  id: number;
  timestamp: string; // ISO 8601
  project_name: string;
  count_result: number;
  image_uri: string;
  notes: string;
}

// --- Singleton DB Manager ---

let dbInstance: SQLite.SQLiteDatabase | null = null;

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }
  dbInstance = await SQLite.openDatabaseAsync('RebarCounter.db');
  await initializeDatabase(dbInstance);
  return dbInstance;
}

async function initializeDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      project_name TEXT DEFAULT '',
      count_result INTEGER NOT NULL,
      image_uri TEXT DEFAULT '',
      notes TEXT DEFAULT ''
    );
  `);
}

// --- CRUD Operations ---

export async function saveRecord(
  count_result: number,
  image_uri: string,
  project_name: string = '',
  notes: string = ''
): Promise<number> {
  const db = await getDatabase();
  const timestamp = new Date().toISOString();

  const result = await db.runAsync(
    `INSERT INTO records (timestamp, project_name, count_result, image_uri, notes)
     VALUES (?, ?, ?, ?, ?)`,
    timestamp,
    project_name,
    count_result,
    image_uri,
    notes
  );

  return result.lastInsertRowId;
}

export async function getAllRecords(): Promise<Record[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record>(
    `SELECT id, timestamp, project_name, count_result, image_uri, notes
     FROM records
     ORDER BY timestamp DESC`
  );
  return rows;
}

export async function getRecordById(id: number): Promise<Record | null> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record>(
    `SELECT id, timestamp, project_name, count_result, image_uri, notes
     FROM records
     WHERE id = ?`,
    id
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function deleteRecord(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM records WHERE id = ?`, id);
}

export async function deleteAllRecords(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM records`);
}

export async function getRecordCount(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ total: number }>(
    `SELECT COUNT(*) as total FROM records`
  );
  return result?.total ?? 0;
}
