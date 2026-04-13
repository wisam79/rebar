import React, { useState } from 'react';
import { AppProvider } from './src/context/AppContext';
import DashboardScreen from './src/screens/DashboardScreen';
import CameraScreen from './src/screens/CameraScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { ChartIcon, CameraIcon, ClockIcon, SettingsIcon } from './src/constants/icons';
import type { TabName } from './src/constants/theme';

const tabs: { name: TabName; label: string; icon: typeof ChartIcon }[] = [
  { name: 'Dashboard', label: 'Dashboard', icon: ChartIcon },
  { name: 'Camera', label: 'Detect', icon: CameraIcon },
  { name: 'History', label: 'History', icon: ClockIcon },
  { name: 'Settings', label: 'Settings', icon: SettingsIcon },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabName>('Dashboard');

  const screens: Record<TabName, React.ReactNode> = {
    Dashboard: <DashboardScreen />,
    Camera: <CameraScreen />,
    History: <HistoryScreen />,
    Settings: <SettingsScreen />,
  };

  const showHeader = activeTab !== 'Camera';
  const headerTitle: Record<TabName, string> = {
    Dashboard: 'Madani Rebar Counter',
    Camera: '',
    History: 'History',
    Settings: 'Settings',
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', width: '100%',
      backgroundColor: 'var(--bg)',
    }}>
      {showHeader && (
        <header style={{
          height: 'var(--header-height)',
          minHeight: 'var(--header-height)',
          backgroundColor: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          paddingLeft: 18, paddingRight: 18,
          paddingTop: 'var(--safe-top)',
        }}>
          <h1 style={{
            fontSize: 17, fontWeight: 700, letterSpacing: '-0.4px',
            color: 'var(--text-1)', margin: 0,
          }}>
            {headerTitle[activeTab]}
          </h1>
        </header>
      )}

      <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {screens[activeTab]}
      </main>

      <nav style={{
        height: 'var(--tab-height)',
        minHeight: 'var(--tab-height)',
        backgroundColor: 'rgba(22, 22, 24, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 'var(--safe-bottom)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(var(--accent-rgb), 0.2), transparent)',
        }} />
        {tabs.map(tab => {
          const focused = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 3,
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 12px', color: 'inherit', flex: 1,
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              {focused && (
                <div style={{
                  position: 'absolute', top: -1, left: '25%', right: '25%',
                  height: 2, borderRadius: 1,
                  background: 'var(--accent)',
                }} />
              )}
              <div style={{
                transition: 'transform 0.2s ease',
                transform: focused ? 'scale(1.1)' : 'scale(1)',
              }}>
                <tab.icon
                  size={focused ? 23 : 21}
                  color={focused ? 'var(--accent)' : 'var(--text-3)'}
                />
              </div>
              <span style={{
                fontSize: 10, fontWeight: focused ? 600 : 500,
                letterSpacing: '0.2px',
                color: focused ? 'var(--accent)' : 'var(--text-3)',
                transition: 'color 0.2s ease, font-weight 0.2s ease',
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
