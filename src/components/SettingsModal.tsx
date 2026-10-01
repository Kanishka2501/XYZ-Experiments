import React, { useState } from 'react';
import { UserProfile, ThemeId, TutorPersonality, DifficultyLevel } from '../types/tutor';
import { StorageService } from '../services/storageService';
import { sound } from '../services/soundService';
import { ThemeSelector } from './ThemeSelector';
import { Sliders, Download, Upload, Trash2, X, Check, Volume2, VolumeX, Eye, AlertTriangle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  currentTheme: ThemeId;
  currentMode: 'dark' | 'light';
  onUpdateProfile: (updated: UserProfile) => void;
  onUpdateTheme: (theme: ThemeId) => void;
  onUpdateMode: (mode: 'dark' | 'light') => void;
  onResetProgress?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  currentTheme,
  currentMode,
  onUpdateProfile,
  onUpdateTheme,
  onUpdateMode,
  onResetProgress,
}) => {
  const [personality, setPersonality] = useState<TutorPersonality>(profile.personality);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(profile.difficulty);
  const [soundEnabled, setSoundEnabled] = useState(sound.isEnabled());
  const [exportNotice, setExportNotice] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [resetSuccessNotice, setResetSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const handleSavePreferences = () => {
    sound.playClick();
    const updated: UserProfile = {
      ...profile,
      personality,
      difficulty,
    };
    StorageService.saveProfile(updated);
    onUpdateProfile(updated);
    onClose();
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
    if (next) sound.playClick();
  };

  const handleExportData = () => {
    sound.playClick();
    const jsonStr = StorageService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_tutor_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importData(content);
      if (success) {
        sound.playMastery();
        setImportStatus('Data successfully restored. Updating workspace...');
        if (onResetProgress) {
          onResetProgress();
        }
        setTimeout(() => {
          setImportStatus(null);
          onClose();
        }, 1200);
      } else {
        setImportStatus('Import failed. Invalid JSON structure.');
      }
    };
    reader.readAsText(file);
  };

  const handleInitiateReset = () => {
    sound.playClick();
    setConfirmResetOpen(true);
  };

  const handleConfirmReset = () => {
    sound.playClick();
    StorageService.resetAllData();
    if (onResetProgress) {
      onResetProgress();
    }
    setConfirmResetOpen(false);
    setResetSuccessNotice(true);
    setTimeout(() => {
      setResetSuccessNotice(false);
      onClose();
    }, 1200);
  };

  const handleCancelReset = () => {
    sound.playClick();
    setConfirmResetOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl glass-panel-elevated shadow-2xl border border-[var(--border-highlight)] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="text-base sm:text-lg font-bold font-display-title text-[var(--text-primary)]">
              System Settings & Aesthetic Engine
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Themes */}
        <ThemeSelector
          currentTheme={currentTheme}
          onThemeChange={onUpdateTheme}
          currentMode={currentMode}
          onModeChange={onUpdateMode}
        />

        {/* Section 2: Tutor Personality */}
        <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-[var(--text-secondary)]">
            Tutor Pedagogical Demeanor
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(
              [
                'Calm Mentor',
                'Strict Coach',
                'Friendly Professor',
                'Quiet Guide',
                'High-Standards Mentor',
              ] as TutorPersonality[]
            ).map((p) => (
              <button
                key={p}
                onClick={() => setPersonality(p)}
                className={`p-3 rounded-xl border text-left text-xs transition-colors ${
                  personality === p
                    ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] font-semibold'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-highlight)]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Difficulty */}
        <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-[var(--text-secondary)]">
            Problem Rigor
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['gentle', 'balanced', 'challenging', 'brutal'] as DifficultyLevel[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`p-2.5 rounded-xl border text-center text-xs capitalize transition-colors ${
                  difficulty === d
                    ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] font-semibold'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: Sound & Feedback */}
        <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
              <span className="text-xs font-medium text-[var(--text-primary)]">Web Audio Synthesized Chimes</span>
            </div>
            <button
              onClick={handleToggleSound}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                soundEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {soundEnabled ? 'Sound ON' : 'Sound OFF'}
            </button>
          </div>
        </div>

        {/* Section 5: Data Backup / Restore & Reset */}
        <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-[var(--text-secondary)]">
            Data Portability (Zero-Lock-in)
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-highlight)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Export Learning State (JSON)</span>
            </button>

            <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-highlight)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span>Restore from Backup</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>

            {!confirmResetOpen && (
              <button
                type="button"
                onClick={handleInitiateReset}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-500/30 dark:bg-red-950/20 bg-red-50 hover:bg-red-100 dark:hover:bg-red-950/40 text-xs dark:text-red-300 text-red-700 transition-colors sm:ml-auto"
                title="Reset all progress and start fresh"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span>Reset Progress</span>
              </button>
            )}
          </div>

          {/* Inline Reset Confirmation Prompt */}
          {confirmResetOpen && (
            <div className="mt-3 p-4 rounded-xl border border-red-500/40 dark:bg-red-950/30 bg-red-50/90 space-y-2.5 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Reset All Learning Progress?</span>
              </div>
              <p className="text-xs dark:text-red-200 text-red-900 leading-relaxed">
                This will reset all concept mastery scores, streaks, independence metrics, unlocked achievements, and session logs to a clean initial state. This action cannot be undone.
              </p>
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  Yes, Reset Everything
                </button>
                <button
                  type="button"
                  onClick={handleCancelReset}
                  className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {resetSuccessNotice && (
            <div className="p-3 rounded-xl border border-emerald-500/40 dark:bg-emerald-950/30 bg-emerald-50 text-xs dark:text-emerald-300 text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>All progress, streaks, and session records have been successfully reset.</span>
            </div>
          )}

          {exportNotice && (
            <div className="text-[11px] font-mono text-emerald-400">
              Backup successfully saved to downloads folder.
            </div>
          )}

          {importStatus && (
            <div className="text-[11px] font-mono text-sky-400">
              {importStatus}
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-end">
          <button
            onClick={handleSavePreferences}
            className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold hover:opacity-90 transition-all shadow-[0_0_15px_var(--accent-glow)]"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
