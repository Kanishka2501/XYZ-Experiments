import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  BookOpen,
  Sparkles,
  Trophy,
  RotateCcw,
  Maximize2,
  Map,
  Palette,
  BarChart3,
  Sliders,
  X,
  Compass,
} from 'lucide-react';
import { sound } from '../services/soundService';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onToggleFocusMode: () => void;
  onOpenThemeModal: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onToggleFocusMode,
  onOpenThemeModal,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    {
      id: 'learn',
      title: 'Enter Socratic Tutor',
      subtitle: 'Resume current concept with progressive scaffolding',
      icon: BookOpen,
      action: () => onNavigate('learn'),
    },
    {
      id: 'practice',
      title: 'Practice Mode',
      subtitle: 'Minimal hints, pure independent reasoning',
      icon: Sparkles,
      action: () => onNavigate('practice'),
    },
    {
      id: 'boss',
      title: 'Mechanics Boss Fight',
      subtitle: '5-stage multi-concept challenge',
      icon: Trophy,
      action: () => onNavigate('boss-fight'),
    },
    {
      id: 'review',
      title: 'Review Weak Concepts',
      subtitle: 'Targeted remediation for diagnosed misconceptions',
      icon: RotateCcw,
      action: () => onNavigate('review'),
    },
    {
      id: 'focus',
      title: 'Toggle Focus Mode',
      subtitle: 'Distraction-free workspace (Ctrl+Shift+F)',
      icon: Maximize2,
      action: () => onToggleFocusMode(),
    },
    {
      id: 'mastery',
      title: 'Mastery Knowledge Map',
      subtitle: 'Explore concept graph and prerequisites',
      icon: Map,
      action: () => onNavigate('mastery'),
    },
    {
      id: 'progress',
      title: 'Learning Analytics & Heatmap',
      subtitle: 'Inspect study streak, independence, and growth',
      icon: BarChart3,
      action: () => onNavigate('progress'),
    },
    {
      id: 'diagnostic',
      title: 'Take Diagnostic Assessment',
      subtitle: 'Find out how you think with 3 adaptive probes',
      icon: Compass,
      action: () => onNavigate('diagnostic'),
    },
    {
      id: 'theme',
      title: 'Change Aesthetic Theme',
      subtitle: 'Night Academia, Midnight, Oxford, Sakura...',
      icon: Palette,
      action: () => onOpenThemeModal(),
    },
    {
      id: 'settings',
      title: 'Settings & Data Export',
      subtitle: 'Tutor personality, sound, backup and restore',
      icon: Sliders,
      action: () => onNavigate('settings'),
    },
  ];

  const filteredCommands = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          sound.playClick();
          // parent will toggle
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (idx: number) => {
    const cmd = filteredCommands[idx];
    if (cmd) {
      sound.playClick();
      cmd.action();
      onClose();
    }
  };

  const handleKeyDownInput = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(selectedIndex);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-2xl glass-panel-elevated shadow-2xl border border-[var(--border-highlight)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <Search className="w-4 h-4 text-[var(--accent)] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownInput}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-8 text-xs text-[var(--text-muted)]">
              No matching commands found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => handleSelect(idx)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    isSelected
                      ? 'bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--text-primary)]'
                      : 'border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected ? 'bg-[var(--accent)] text-[var(--accent-contrast)]' : 'bg-[var(--bg-surface)] text-[var(--accent)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[var(--text-primary)] truncate">{cmd.title}</div>
                    <div className="text-[11px] text-[var(--text-muted)] truncate">{cmd.subtitle}</div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] bg-[var(--bg-base)]">
          <span>Navigate with ↑ ↓ and Enter</span>
          <span className="font-mono text-[10px]">ESC to close</span>
        </div>
      </div>
    </div>
  );
};
