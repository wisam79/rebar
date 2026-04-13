import React, { useCallback, useEffect, useState } from 'react';
import {
  getRecordCount,
  getTotalRebarCount,
  getAverageCount,
  getDailyStats,
  getProjectStats,
  getRecentRecords,
} from '../services/db';
import type { DailyStats, ProjectStats, DetectionRecord } from '../services/db';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { useAppContext } from '../context/AppContext';
import {
  RebarIcon, ChartIcon, FolderIcon, ClockIcon, CameraIcon,
} from '../constants/icons';

export default function DashboardScreen() {
  const { activeProject } = useAppContext();
  const [totalCount, setTotalCount] = useState(0);
  const [totalRebars, setTotalRebars] = useState(0);
  const [avgCount, setAvgCount] = useState(0);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [projectStats, setProjectStats] = useState<ProjectStats[]>([]);
  const [recentRecords, setRecentRecords] = useState<DetectionRecord[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [c, t, a, d, p, r] = await Promise.all([
        getRecordCount(), getTotalRebarCount(), getAverageCount(),
        getDailyStats(7), getProjectStats(), getRecentRecords(5),
      ]);
      setTotalCount(c); setTotalRebars(t); setAvgCount(a);
      setDailyStats(d); setProjectStats(p); setRecentRecords(r);
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const maxDailyCount = Math.max(...dailyStats.map(d => d.total_count), 1);

  return (
    <div className="screen" style={{ padding: 16, paddingBottom: 48, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {activeProject && (
        <Card style={{ background: 'var(--accent-light)', borderColor: 'rgba(var(--accent-rgb), 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(var(--accent-rgb), 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FolderIcon size={20} color="var(--accent)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--accent)' }}>Active Project</div>
              <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.4px', color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeProject.name}</div>
              {activeProject.location && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 1 }}>{activeProject.location}</div>}
            </div>
            <Badge label="Active" variant="accent" size="sm" />
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        {[
          { icon: <RebarIcon size={18} color="var(--accent)" />, value: totalRebars, label: 'Total Rebars', color: 'var(--accent)', bg: 'var(--accent-light)' },
          { icon: <CameraIcon size={18} color="var(--success)" />, value: totalCount, label: 'Sessions', color: 'var(--success)', bg: 'var(--success-light)' },
          { icon: <ChartIcon size={18} color="var(--warning)" />, value: avgCount, label: 'Average', color: 'var(--warning)', bg: 'var(--warning-light)' },
        ].map((m, i) => (
          <Card key={i} style={{ flex: 1, padding: '14px 8px' }}>
            <div className="metric-card">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                {m.icon}
              </div>
              <div className="metric-value" style={{ color: m.color }}>{m.value}</div>
              <div className="metric-label">{m.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {dailyStats.length > 0 && (
        <Card>
          <div className="card-header">
            <ChartIcon size={16} color="var(--accent)" />
            <span className="card-title">Last 7 Days</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: 120, gap: 6, paddingTop: 8 }}>
            {dailyStats.map((d, i) => {
              const height = Math.max((d.total_count / maxDailyCount) * 88, 4);
              return (
                <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-2)' }}>{d.total_count}</span>
                  <div style={{ width: '100%', maxWidth: 32, height: 88, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div style={{
                      width: '65%', height, borderRadius: 6, minHeight: 4,
                      background: i === 0 ? 'linear-gradient(180deg, var(--accent), var(--accent-dark))' : 'var(--surface-3)',
                      transition: 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-3)' }}>
                    {new Date(d.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'narrow' })}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {projectStats.length > 0 && (
        <Card>
          <div className="card-header">
            <FolderIcon size={16} color="var(--accent)" />
            <span className="card-title">By Project</span>
          </div>
          {projectStats.map((p, i) => (
            <div key={p.project_name} className="project-row" style={{ paddingLeft: 0, paddingRight: 0 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, flexShrink: 0, background: i === 0 ? 'var(--accent)' : i === 1 ? 'var(--success)' : 'var(--warning)', marginRight: 10 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.project_name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{p.session_count} sessions · avg {p.avg_per_session}</div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.5px' }}>{p.total_rebars}</div>
            </div>
          ))}
        </Card>
      )}

      {recentRecords.length > 0 && (
        <Card>
          <div className="card-header">
            <ClockIcon size={16} color="var(--accent)" />
            <span className="card-title">Recent Activity</span>
          </div>
          {recentRecords.map(r => (
            <div key={r.id} className="project-row" style={{ paddingLeft: 0, paddingRight: 0, gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RebarIcon size={14} color="var(--accent)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.project_name || 'Unassigned'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{new Date(r.timestamp).toLocaleDateString()} · {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.5px' }}>{r.count_result}</div>
            </div>
          ))}
        </Card>
      )}

      {totalCount === 0 && (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--surface-2)', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RebarIcon size={32} color="var(--text-3)" />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>No Data Yet</div>
            <div style={{ fontSize: 14, color: 'var(--text-2)', textAlign: 'center', lineHeight: 1.5, maxWidth: 260 }}>Start detecting rebar with the camera to see your statistics here.</div>
          </div>
        </Card>
      )}
    </div>
  );
}
