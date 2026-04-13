import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Project } from '../services/db';
import { getAllProjects } from '../services/db';

interface AppSettings {
  confidenceThreshold: number;
  nmsIouThreshold: number;
  flashEnabled: boolean;
  selectedProjectId: number | null;
  rebarDiameter: number;
  rebarGrade: string;
}

interface AppContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  projects: (Project & { record_count: number })[];
  refreshProjects: () => Promise<void>;
  activeProject: (Project & { record_count: number }) | null;
}

const DEFAULT_SETTINGS: AppSettings = {
  confidenceThreshold: 0.5,
  nmsIouThreshold: 0.45,
  flashEnabled: false,
  selectedProjectId: null,
  rebarDiameter: 12,
  rebarGrade: 'B500B',
};

const STORAGE_KEY = 'madani_app_settings';

function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [projects, setProjects] = useState<(Project & { record_count: number })[]>([]);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const refreshProjects = useCallback(async () => {
    try {
      const p = await getAllProjects();
      setProjects(p);
    } catch {}
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

  const activeProject = projects.find(p => p.id === settings.selectedProjectId) ?? null;

  return (
    <AppContext.Provider value={{ settings, updateSetting, projects, refreshProjects, activeProject }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
