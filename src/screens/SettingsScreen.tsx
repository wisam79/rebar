import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getRecordCount, deleteAllRecords, createProject, deleteProject } from '../services/db';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import Badge from '../components/Badge';
import {
  SlidersIcon, ShieldIcon, InfoIcon, TrashIcon, PlusIcon, FolderIcon, EditIcon,
} from '../constants/icons';

export default function SettingsScreen() {
  const { settings, updateSetting, projects, refreshProjects } = useAppContext();
  const [recordCount, setRecordCount] = useState(0);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectLocation, setNewProjectLocation] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const fetchCount = useCallback(async () => { setRecordCount(await getRecordCount()); }, []);
  useEffect(() => { fetchCount(); }, [fetchCount]);

  const handleSliderMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!draggingRef.current || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.max(10, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    updateSetting('confidenceThreshold', Math.round(percent) / 100);
  }, [updateSetting]);

  const handleSliderDown = useCallback((e: React.MouseEvent) => {
    draggingRef.current = true;
    handleSliderMove(e);
  }, [handleSliderMove]);

  useEffect(() => {
    const up = () => { draggingRef.current = false; };
    const move = (e: MouseEvent) => { handleSliderMove(e); };
    window.addEventListener('mouseup', up);
    window.addEventListener('mousemove', move);
    return () => { window.removeEventListener('mouseup', up); window.removeEventListener('mousemove', move); };
  }, [handleSliderMove]);

  const handleClearHistory = useCallback(async () => {
    if (!confirmClear) { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 3000); return; }
    try { await deleteAllRecords(); setRecordCount(0); setConfirmClear(false); } catch { console.error('Failed'); }
  }, [confirmClear]);

  const handleCreateProject = useCallback(async () => {
    if (!newProjectName.trim()) return;
    try {
      await createProject(newProjectName.trim(), newProjectLocation.trim());
      setNewProjectName(''); setNewProjectLocation(''); setShowNewProject(false);
      refreshProjects();
    } catch { console.error('Failed'); }
  }, [newProjectName, newProjectLocation, refreshProjects]);

  const handleDeleteProject = useCallback(async (id: number) => {
    try {
      await deleteProject(id); refreshProjects();
      if (settings.selectedProjectId === id) updateSetting('selectedProjectId', null);
    } catch { console.error('Failed'); }
  }, [settings.selectedProjectId, updateSetting, refreshProjects]);

  return (
    <div className="screen" style={{ padding: 16, paddingBottom: 48, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card>
        <div className="card-header">
          <SlidersIcon size={16} color="var(--accent)" />
          <span className="card-title">Detection Settings</span>
        </div>
        <div className="setting-row">
          <div style={{ flex: 1 }}>
            <div className="setting-label">Confidence Threshold</div>
            <div className="setting-desc">Minimum detection confidence ({Math.round(settings.confidenceThreshold * 100)}%)</div>
          </div>
          <span className="setting-value">{settings.confidenceThreshold.toFixed(2)}</span>
        </div>
        <div ref={sliderRef} onMouseDown={handleSliderDown} className="slider-track">
          <div className="slider-fill" style={{ width: `${settings.confidenceThreshold * 100}%` }} />
          <div className="slider-thumb" style={{ left: `${settings.confidenceThreshold * 100}%` }} />
        </div>
        <div className="divider" style={{ marginTop: 8, marginBottom: 8 }} />
        <div className="setting-row">
          <div style={{ flex: 1 }}>
            <div className="setting-label">NMS IoU Threshold</div>
            <div className="setting-desc">Overlap suppression ({settings.nmsIouThreshold.toFixed(2)})</div>
          </div>
          <span className="setting-value">{settings.nmsIouThreshold.toFixed(2)}</span>
        </div>
      </Card>

      <Card>
        <div className="card-header">
          <EditIcon size={16} color="var(--accent)" />
          <span className="card-title">Rebar Specifications</span>
        </div>
        <div className="setting-row">
          <span className="setting-label">Diameter (mm)</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' }}>
            {[8, 10, 12, 16, 20, 25, 32].map(d => (
              <button key={d} onClick={() => updateSetting('rebarDiameter', d)}
                className={`chip ${settings.rebarDiameter === d ? 'chip-active' : ''}`}
                style={{ padding: '4px 10px', fontSize: 12, fontWeight: settings.rebarDiameter === d ? 700 : 500 }}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="divider" />
        <div className="setting-row">
          <span className="setting-label">Grade</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {['B500A', 'B500B', 'B500C'].map(g => (
              <button key={g} onClick={() => updateSetting('rebarGrade', g)}
                className={`chip ${settings.rebarGrade === g ? 'chip-active' : ''}`}
                style={{ padding: '4px 10px', fontSize: 12, fontWeight: settings.rebarGrade === g ? 700 : 500 }}>
                {g}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="card-header">
          <ShieldIcon size={16} color="var(--accent)" />
          <span className="card-title">Camera</span>
        </div>
        <div className="setting-row">
          <div style={{ flex: 1 }}>
            <div className="setting-label">Flash / Torch</div>
            <div className="setting-desc">Enable camera flashlight</div>
          </div>
          <button
            onClick={() => updateSetting('flashEnabled', !settings.flashEnabled)}
            className="toggle-track"
            style={{ background: settings.flashEnabled ? 'var(--accent)' : 'var(--surface-2)' }}
          >
            <div className="toggle-thumb" style={{
              left: settings.flashEnabled ? 22 : 2,
              background: settings.flashEnabled ? '#fff' : 'var(--text-3)',
            }} />
          </button>
        </div>
      </Card>

      <Card>
        <div className="card-header">
          <FolderIcon size={16} color="var(--accent)" />
          <span className="card-title">Projects</span>
          <button onClick={() => setShowNewProject(!showNewProject)} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}>
            <PlusIcon size={18} color="var(--accent)" />
          </button>
        </div>

        {showNewProject && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14, padding: 14, background: 'var(--surface-2)', borderRadius: 12 }}>
            <input type="text" placeholder="Project name" className="input-field" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} />
            <input type="text" placeholder="Location (optional)" className="input-field" value={newProjectLocation} onChange={e => setNewProjectLocation(e.target.value)} />
            <button onClick={handleCreateProject} style={{
              background: 'var(--accent)', color: '#fff', padding: '12px', borderRadius: 10,
              border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600,
              transition: 'opacity 0.15s ease',
            }}>
              Create Project
            </button>
          </div>
        )}

        {projects.length === 0 && !showNewProject && (
          <div style={{ fontSize: 14, color: 'var(--text-3)', textAlign: 'center', padding: '14px 0' }}>
            No projects yet. Create one to organize your counts.
          </div>
        )}

        {projects.map(p => (
          <div key={p.id} className="project-row" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{p.name}</div>
              {p.location && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 1 }}>{p.location}</div>}
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{p.record_count} records</div>
            </div>
            <button onClick={() => handleDeleteProject(p.id!)} style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
              <TrashIcon size={16} color="var(--text-3)" />
            </button>
          </div>
        ))}
      </Card>

      <Card>
        <div className="card-header">
          <InfoIcon size={16} color="var(--accent)" />
          <span className="card-title">Data</span>
        </div>
        <div className="setting-row">
          <span className="setting-label">Saved Records</span>
          <Badge label={String(recordCount)} variant="accent" size="md" />
        </div>
        <div className="divider" />
        <div className="setting-desc">All data is stored locally on device. No cloud sync. No data leaves your device.</div>
        <button onClick={handleClearHistory} className="danger-btn" style={{ background: confirmClear ? 'var(--danger)' : undefined }}>
          <TrashIcon size={16} color="var(--danger)" />
          <span className="danger-btn-text">{confirmClear ? `Tap Again to Delete ${recordCount} Records` : 'Clear All History'}</span>
        </button>
      </Card>

      <Card>
        <div className="card-header">
          <InfoIcon size={16} color="var(--accent)" />
          <span className="card-title">About</span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', marginBottom: 2 }}>Madani Rebar Counter</div>
        <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 8 }}>Version 2.0.0</div>
        <div className="setting-desc">Professional on-device rebar detection and counting using YOLO-based ML inference. Works entirely offline. No internet required.</div>
      </Card>
    </div>
  );
}
