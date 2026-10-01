import React from 'react';
import { NexusLogo } from './NexusLogo';
import { ThemeSelector } from './ThemeSelector';
import { ThemeId, UserProfile } from '../types/tutor';
import { sound } from '../services/soundService';
import {
  Home,
  BookOpen,
  Sparkles,
  RotateCcw,
  Map,
  Trophy,
  BarChart3,
  Sliders,
  Search,
  Flame,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  currentMode: 'dark' | 'light';
  onModeChange: (mode: 'dark' | 'light') => void;
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
  profile: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentTheme,
  onThemeChange,
  currentMode,
  onModeChange,
  onOpenCommandPalette,
  onOpenSettings,
  profile,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'practice', label: 'Practice', icon: Sparkles },
    { id: 'review', label: 'Review', icon: RotateCcw },
    { id: 'mastery', label: 'Mastery', icon: Map },
    { id: 'boss-fight', label: 'Boss Fight', icon: Trophy },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
  ];

  return (
    <>
      {/* Desktop Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] glass-panel px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div
            className="cursor-pointer"
            onClick={() => {
              sound.playClick();
              onNavigate('dashboard');
            }}
          >
            <NexusLogo size="md" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sound.playClick();
                    onNavigate(item.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Action Tools */}
          <div className="flex items-center gap-2">
            {/* Command Palette Trigger */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenCommandPalette();
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-highlight)] transition-colors"
              title="Command Palette (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="hidden sm:inline font-mono text-[11px]">Cmd+K</span>
            </button>

            {/* Streak Badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-mono text-amber-400"
              title={`${profile.streak} days streak`}
            >
              <Flame className="w-3.5 h-3.5 fill-amber-400/20" />
              <span>{profile.streak}d</span>
            </div>

            {/* Theme Selector Popover */}
            <ThemeSelector
              currentTheme={currentTheme}
              onThemeChange={onThemeChange}
              currentMode={currentMode}
              onModeChange={onModeChange}
              compact
            />

            {/* Settings Trigger */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenSettings();
              }}
              className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-highlight)] transition-colors"
              title="Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border-subtle)] glass-panel px-2 py-2 flex items-center justify-around">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                onNavigate(item.id);
              }}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-[var(--accent)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
