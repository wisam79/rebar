import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { DetectionRecord, ProjectStats } from '../services/db';
import {
  getAllRecords, deleteRecord, searchRecords, getProjectStats,
  getRecordCount, getTotalRebarCount, getAverageCount, exportRecordsAsCSV,
} from '../services/db';
import Card from '../components/Card';
import Badge from '../components/Badge';
import {
  SearchIcon, ExportIcon, TrashIcon, RebarIcon, ClockIcon, FolderIcon,
} from '../constants/icons';

function formatDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return iso; }
}

function formatTime(iso: string): string {
  try { return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}

function RecordCard({ record, onDelete }: { record: DetectionRecord; onDelete: (id: number) => void }) {
  return (
    <Card elevated style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: 'var(--accent-light)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
        }}>
          <RebarIcon size={14} color="var(--accent)" />
          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.5px', lineHeight: 1 }}>{record.count_result}</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {record.project_name || 'Unassigned'}
            </span>
            {record.rebar_diameter > 0 && <Badge label={`Ø${record.rebar_diameter}mm`} variant="accent" size="sm" />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: record.notes ? 2 : 0 }}>
            <ClockIcon size={11} color="var(--text-3)" />
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{formatDate(record.timestamp)} · {formatTime(record.timestamp)}</span>
          </div>
          {record.notes && (
            <span style={{ fontSize: 11, color: 'var(--text-2)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
              {record.notes}
            </span>
          )}
        </div>

        <button onClick={() => onDelete(record.id!)} style={{
          padding: 8, background: 'none', border: 'none', cursor: 'pointer',
          borderRadius: 10, transition: 'background 0.15s ease',
        }}>
          <TrashIcon size={16} color="var(--text-3)" />
        </button>
      </div>
    </Card>
  );
}

export default function HistoryScreen() {
  const [records, setRecords] = useState<DetectionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [projectStats, setProjectStats] = useState<ProjectStats[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalRebars, setTotalRebars] = useState(0);
  const [avgCount, setAvgCount] = useState(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = debouncedQuery ? await searchRecords(debouncedQuery) : await getAllRecords();
      setRecords(data);
      const [stats, c, t, a] = await Promise.all([getProjectStats(), getRecordCount(), getTotalRebarCount(), getAverageCount()]);
      setProjectStats(stats); setTotalCount(c); setTotalRebars(t); setAvgCount(a);
    } catch (e) {
      console.error('Failed to fetch records:', e);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteRecord(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      const [stats, c, t, a] = await Promise.all([getProjectStats(), getRecordCount(), getTotalRebarCount(), getAverageCount()]);
      setProjectStats(stats); setTotalCount(c); setTotalRebars(t); setAvgCount(a);
    } catch (e) { console.error('Failed to delete record:', e); }
  }, []);

  const handleExport = useCallback(async () => {
    try {
      const csv = await exportRecordsAsCSV();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'rebar_export.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error('Export failed:', e); }
  }, []);

  if (!loading && records.length === 0 && !isSearchActive) {
    return (
      <div style={{
        flex: 1, background: 'var(--bg)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: 32, animation: 'fadeIn 0.4s ease',
      }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--surface-2)', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RebarIcon size={32} color="var(--text-3)" />
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>No History Yet</div>
        <div style={{ fontSize: 14, color: 'var(--text-2)', textAlign: 'center', lineHeight: 1.5, maxWidth: 260 }}>Captured rebar counts will appear here with project details.</div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ padding: '12px 16px 0' }}>
        {isSearchActive ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--surface-2)', borderRadius: 12, padding: '0 12px', height: 44,
          }}>
            <SearchIcon size={18} color="var(--text-3)" />
            <input type="text" placeholder="Search projects, notes…" className="input-field"
              style={{ flex: 1, background: 'none', border: 'none', padding: 0, borderRadius: 0 }}
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus
            />
            <button onClick={() => { setSearchQuery(''); setIsSearchActive(false); }}
              style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Cancel
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={() => setIsSearchActive(true)} className="icon-btn" style={{ width: 40, height: 40, background: 'var(--surface)' }}>
              <SearchIcon size={18} color="var(--text-2)" />
            </button>
            <button onClick={handleExport} className="icon-btn" style={{ width: 40, height: 40, background: 'var(--surface)' }}>
              <ExportIcon size={18} color="var(--text-2)" />
            </button>
          </div>
        )}
      </div>

      {totalCount > 0 && (
        <div style={{
          display: 'flex', margin: '12px 16px', background: 'var(--surface)',
          borderRadius: 14, padding: 16, border: '1px solid var(--border)',
        }}>
          {[{ value: totalCount, label: 'Sessions' }, { value: totalRebars, label: 'Total Rebars' }, { value: avgCount, label: 'Average' }].map((item, i, arr) => (
            <React.Fragment key={item.label}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.5px' }}>{item.value}</span>
                <span style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, fontWeight: 500 }}>{item.label}</span>
              </div>
              {i < arr.length - 1 && <div style={{ width: 1, background: 'var(--border)' }} />}
            </React.Fragment>
          ))}
        </div>
      )}

      {projectStats.length > 0 && !searchQuery && (
        <div style={{ display: 'flex', margin: '0 16px 8px', gap: 8, overflowX: 'auto' }}>
          {projectStats.slice(0, 3).map(p => (
            <div key={p.project_name} className="chip" style={{ flexShrink: 0 }}>
              <FolderIcon size={11} color="var(--accent)" />
              <span style={{ maxWidth: 50, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.project_name}</span>
              <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{p.total_rebars}</span>
            </div>
          ))}
        </div>
      )}

      <div className="screen" style={{ padding: '8px 16px 32px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {records.map(r => <RecordCard key={r.id} record={r} onDelete={handleDelete} />)}
        {loading && <div style={{ fontSize: 14, color: 'var(--text-3)', textAlign: 'center', marginTop: 32 }}>Loading records…</div>}
        {!loading && records.length === 0 && <div style={{ fontSize: 14, color: 'var(--text-3)', textAlign: 'center', marginTop: 32 }}>No records match your search.</div>}
      </div>
    </div>
  );
}
