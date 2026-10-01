import React, { useState } from 'react';
import { Concept } from '../types/tutor';
import { sound } from '../services/soundService';
import { MathRenderer } from './MathRenderer';
import { Map, ArrowRight, Lock, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface MasteryMapViewProps {
  concepts: Concept[];
  onSelectConcept: (conceptId: string) => void;
  onExit: () => void;
}

export const MasteryMapView: React.FC<MasteryMapViewProps> = ({
  concepts,
  onSelectConcept,
  onExit,
}) => {
  const [selectedConcept, setSelectedConcept] = useState<Concept>(concepts[0]);
  const [activeSubject, setActiveSubject] = useState('Physics');

  const filteredConcepts = concepts.filter((c) => c.subjectId === activeSubject);

  const getStatusColor = (status: Concept['status']) => {
    switch (status) {
      case 'mastered':
        return 'border-emerald-500 dark:bg-emerald-950/40 bg-emerald-50 dark:text-emerald-300 text-emerald-800 shadow-[0_0_15px_rgba(52,211,153,0.3)]';
      case 'strong':
        return 'border-sky-500 dark:bg-sky-950/40 bg-sky-50 dark:text-sky-300 text-sky-800 shadow-[0_0_12px_rgba(56,189,248,0.25)]';
      case 'developing':
        return 'border-amber-500 dark:bg-amber-950/40 bg-amber-50 dark:text-amber-300 text-amber-800 shadow-[0_0_12px_rgba(251,191,36,0.2)]';
      case 'learning':
        return 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] shadow-[0_0_10px_var(--accent-glow)]';
      case 'locked':
      default:
        return 'dark:border-neutral-700 border-neutral-300 dark:bg-neutral-900/60 bg-neutral-100 dark:text-neutral-500 text-neutral-600';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-[var(--accent)]" />
            <h1 className="text-xl sm:text-2xl font-bold font-display-title text-[var(--text-primary)]">
              Epistemic Knowledge Map
            </h1>
          </div>
          <p className="font-serif-academic italic text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            “Concepts are not isolated silos. They form a directed graph of intellectual prerequisites.”
          </p>
        </div>

        {/* Subject Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
          {['Physics', 'Mathematics', 'Chemistry', 'Computer Science'].map((subj) => (
            <button
              key={subj}
              onClick={() => {
                sound.playClick();
                setActiveSubject(subj);
                const first = concepts.find((c) => c.subjectId === subj);
                if (first) setSelectedConcept(first);
              }}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-medium ${
                activeSubject === subj
                  ? 'bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Map Nodes + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Node Flow (8 cols) */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-2xl glass-panel-elevated border border-[var(--border-highlight)] relative overflow-hidden">
          <div className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)] mb-6">
            Directed Prerequisite Lattice &middot; {activeSubject}
          </div>

          {/* Node Lattice Layout */}
          <div className="relative space-y-6">
            {filteredConcepts.map((concept, idx) => {
              const isSelected = selectedConcept.id === concept.id;
              const hasNext = idx < filteredConcepts.length - 1;

              return (
                <div key={concept.id} className="relative">
                  <div
                    onClick={() => {
                      sound.playClick();
                      setSelectedConcept(concept);
                    }}
                    className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'ring-2 ring-[var(--accent)] border-[var(--accent)] bg-[var(--bg-surface-elevated)] scale-[1.01]'
                        : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center font-mono text-xs font-bold ${getStatusColor(
                          concept.status
                        )}`}
                      >
                        {concept.order}
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          {concept.title}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {concept.moduleTitle} &middot; Prerequisites: {concept.prerequisites.length ? `${concept.prerequisites.length} links` : 'Fundamental Base'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono">
                        <div className="text-xs font-semibold text-[var(--accent)]">{concept.masteryScore}%</div>
                        <div className="text-[10px] text-[var(--text-muted)] capitalize">{concept.status}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
                    </div>
                  </div>

                  {/* Connecting Prerequisite Thread */}
                  {hasNext && (
                    <div className="w-0.5 h-6 bg-[var(--border-subtle)] mx-auto my-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Node Intelligence Inspector (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl glass-panel border border-[var(--border-subtle)] space-y-6">
          <div>
            <div className="text-[10px] font-mono text-[var(--accent)] uppercase tracking-wider mb-1">
              Active Concept Inspector
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              {selectedConcept.title}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
              {selectedConcept.description}
            </p>
          </div>

          {/* Mastery Meter */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[var(--text-secondary)]">Mastery State:</span>
              <span className="text-[var(--accent)] font-semibold">{selectedConcept.masteryScore}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--bg-base)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                style={{ width: `${selectedConcept.masteryScore}%` }}
              />
            </div>
          </div>

          {/* Canonical Formulas */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block">
              Canonical Invariants:
            </span>
            {selectedConcept.canonicalFormulas.map((f, i) => (
              <div key={i} className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <div className="text-[11px] font-semibold text-[var(--text-primary)] mb-1">{f.label}</div>
                <div className="text-xs text-[var(--text-secondary)] font-mono">
                  <MathRenderer math={f.latex} />
                </div>
              </div>
            ))}
          </div>

          {/* Objectives */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block">
              Core Objectives:
            </span>
            <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
              {selectedConcept.learningObjectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>

          {/* Launch Session Button */}
          <button
            onClick={() => {
              sound.playClick();
              onSelectConcept(selectedConcept.id);
            }}
            className="w-full py-3.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold uppercase tracking-wider shadow-[0_0_20px_var(--accent-glow)] hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <span>Launch Socratic Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
