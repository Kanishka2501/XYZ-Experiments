import React, { useState } from 'react';
import { Palette, Sun, Moon, Check } from 'lucide-react';
import { ThemeId } from '../types/tutor';
import { StorageService } from '../services/storageService';
import { sound } from '../services/soundService';

interface ThemeSelectorProps {
  currentTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  currentMode: 'dark' | 'light';
  onModeChange: (mode: 'dark' | 'light') => void;
  compact?: boolean;
}

export const THEME_DEFINITIONS: {
  id: ThemeId;
  name: string;
  subtitle: string;
  lightSubtitle: string;
  colors: string[];
  lightColors: string[];
}[] = [
  {
    id: 'night-academia',
    name: 'Night Academia',
    subtitle: 'Warm ivory & candlelight gold',
    lightSubtitle: 'Antique parchment & warm amber',
    colors: ['#0b0c0e', '#d4a359', '#f6f1e8'],
    lightColors: ['#fbf9f4', '#b47d28', '#1f1a14'],
  },
  {
    id: 'midnight',
    name: 'Midnight',
    subtitle: 'Electric violet & deep cosmos',
    lightSubtitle: 'Solar dawn & royal mathematical indigo',
    colors: ['#060813', '#6366f1', '#f0f4ff'],
    lightColors: ['#f4f6fd', '#4f46e5', '#0f172a'],
  },
  {
    id: 'aurora',
    name: 'Aurora',
    subtitle: 'Luminous teal & borealis emerald',
    lightSubtitle: 'Fresh alpine mint & boreal emerald',
    colors: ['#05141c', '#14b8a6', '#f0fdf4'],
    lightColors: ['#f0fbf7', '#0d9488', '#0d2822'],
  },
  {
    id: 'oxford',
    name: 'Oxford',
    subtitle: 'British racing green & brass gold',
    lightSubtitle: 'Collegiate botanical & vintage brass',
    colors: ['#08160f', '#d4af37', '#fbf7ee'],
    lightColors: ['#f6f8f4', '#a16207', '#121e14'],
  },
  {
    id: 'sakura',
    name: 'Sakura',
    subtitle: 'Deep plum & soft cherry blossom',
    lightSubtitle: 'Spring blossom & Kyoto rose',
    colors: ['#140914', '#f472b6', '#fdf2f8'],
    lightColors: ['#fdf5f8', '#db2777', '#261020'],
  },
  {
    id: 'crimson',
    name: 'Crimson',
    subtitle: 'Dramatic burgundy & ivory obsidian',
    lightSubtitle: 'Alabaster ruby & carmine ink',
    colors: ['#120406', '#e11d48', '#fff1f2'],
    lightColors: ['#fff5f5', '#e11d48', '#1f0a0e'],
  },
  {
    id: 'arctic',
    name: 'Arctic',
    subtitle: 'Glacial ice cyan & frosted glass',
    lightSubtitle: 'Glacial clean & cerulean sky',
    colors: ['#06111e', '#38bdf8', '#f0f9ff'],
    lightColors: ['#f0f7ff', '#0284c7', '#091e36'],
  },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
  currentMode,
  onModeChange,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (themeId: ThemeId) => {
    sound.playClick();
    onThemeChange(themeId);
    StorageService.saveTheme(themeId);
    setIsOpen(false);
  };

  const handleModeToggle = () => {
    sound.playClick();
    const nextMode = currentMode === 'dark' ? 'light' : 'dark';
    onModeChange(nextMode);
    StorageService.saveThemeMode(nextMode);
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-highlight)] transition-colors"
          title="Switch Theme"
          aria-label="Theme menu"
        >
          <Palette className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="hidden sm:inline">Theme</span>
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 mt-2 w-64 p-2 z-50 rounded-xl glass-panel-elevated shadow-2xl border border-[var(--border-highlight)]">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-subtle)] px-2">
                <span className="text-xs font-semibold text-[var(--text-primary)]">Atmosphere</span>
                <button
                  onClick={handleModeToggle}
                  className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2 py-0.5 rounded bg-[var(--bg-surface)]"
                  title="Toggle Light/Dark"
                >
                  {currentMode === 'dark' ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-indigo-400" />}
                  <span>{currentMode === 'dark' ? 'Light' : 'Dark'}</span>
                </button>
              </div>

              <div className="space-y-1">
                {THEME_DEFINITIONS.map((t) => {
                  const activeSwatches = currentMode === 'light' ? t.lightColors : t.colors;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelect(t.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                        currentTheme === t.id
                          ? 'bg-[var(--accent)]/15 text-[var(--accent)] font-medium border border-[var(--accent)]/30'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex -space-x-1">
                          {activeSwatches.map((c, i) => (
                            <span
                              key={i}
                              className="w-3 h-3 rounded-full border border-black/20 shadow-sm"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <span>{t.name}</span>
                      </div>
                      {currentTheme === t.id && <Check className="w-3.5 h-3.5 text-[var(--accent)]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Intellectual Atmosphere</h3>
          <p className="text-xs text-[var(--text-muted)]">Select your aesthetic environment</p>
        </div>
        <button
          onClick={handleModeToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          {currentMode === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
          <span>{currentMode === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {THEME_DEFINITIONS.map((t) => {
          const activeSwatches = currentMode === 'light' ? t.lightColors : t.colors;
          const activeSubtitle = currentMode === 'light' ? t.lightSubtitle : t.subtitle;
          return (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id)}
              className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all ${
                currentTheme === t.id
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]/30 shadow-[0_0_15px_var(--accent-glow)]'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-highlight)] hover:bg-[var(--bg-surface-elevated)]'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--text-primary)]">{t.name}</span>
                  {currentTheme === t.id && <Check className="w-3.5 h-3.5 text-[var(--accent)]" />}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{activeSubtitle}</p>
              </div>
              <div className="flex -space-x-1.5 mt-1">
                {activeSwatches.map((c, i) => (
                  <span
                    key={i}
                    className="w-4 h-4 rounded-full border border-black/20 shadow-sm"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
