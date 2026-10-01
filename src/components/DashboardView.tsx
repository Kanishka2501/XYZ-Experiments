import React from 'react';
import { UserProfile, Concept, MisconceptionRecord, Achievement, SpacedReviewItem } from '../types/tutor';
import { sound } from '../services/soundService';
import {
  ArrowRight,
  Flame,
  Clock,
  Sparkles,
  Trophy,
  Zap,
  Target,
  Brain,
  Shield,
  Layers,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { MathRenderer } from './MathRenderer';

interface DashboardViewProps {
  profile: UserProfile;
  concepts: Concept[];
  misconceptions: MisconceptionRecord[];
  achievements: Achievement[];
  spacedReview: SpacedReviewItem[];
  onStartLesson: (conceptId: string, mode?: string) => void;
  onNavigate: (view: string) => void;
  onLaunchBossFight: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  concepts,
  misconceptions,
  achievements,
  onStartLesson,
  onNavigate,
  onLaunchBossFight,
}) => {
  // Compute greeting based on local time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Find active concept
  const activeConcept = concepts.find((c) => c.id === profile.activeConceptId) || concepts[0];

  // Subject mastery calculations
  const subjects = ['Physics', 'Mathematics', 'Chemistry', 'Computer Science'];
  const subjectMastery = subjects.map((subj) => {
    const subjConcepts = concepts.filter((c) => c.subjectId === subj);
    if (!subjConcepts.length) return { subject: subj, mastery: 50 };
    const avg = Math.round(
      subjConcepts.reduce((acc, c) => acc + c.masteryScore, 0) / subjConcepts.length
    );
    return { subject: subj, mastery: avg };
  });

  // Weak areas (concepts with score < 60 or active misconceptions)
  const weakAreas = misconceptions.filter((m) => !m.resolved).slice(0, 3);

  // Overall mission progress for Physics
  const physicsConcepts = concepts.filter((c) => c.subjectId === 'Physics');
  const missionProgress = Math.round(
    physicsConcepts.reduce((acc, c) => acc + c.masteryScore, 0) / (physicsConcepts.length || 1)
  );

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Hero Welcome Command Center Banner */}
      <div className="relative p-6 sm:p-8 rounded-2xl glass-panel-elevated border border-[var(--border-highlight)] overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-glow)] rounded-full blur-[110px] pointer-events-none opacity-30" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-xs font-mono text-[var(--accent)] tracking-widest uppercase mb-1">
              Personal Command Center &middot; Socratic Sentry
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-display-title text-[var(--text-primary)]">
              {greeting}, {profile.name}.
            </h1>
            <p className="font-serif-academic italic text-sm sm:text-base text-[var(--text-secondary)] mt-1 max-w-xl">
              “Don’t memorize. Understand. Your intellect sharpens where intuition meets rigorous proof.”
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => {
                sound.playClick();
                onStartLesson(activeConcept.id, 'tutor');
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold uppercase tracking-wider shadow-[0_0_20px_var(--accent-glow)] hover:opacity-90 transition-all"
            >
              <span>Resume Study</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* TODAY'S MISSION BAR */}
        <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[var(--accent)]" />
              <span className="font-mono uppercase tracking-wider text-[var(--text-primary)] font-semibold">
                Today's Mission:
              </span>
              <span className="text-[var(--text-secondary)] font-medium">Master Classical Mechanics & Newton's Laws</span>
            </div>
            <span className="font-mono text-xs text-[var(--accent)] font-semibold">{missionProgress}% Complete</span>
          </div>

          {/* Clean progress bar */}
          <div className="w-full h-2.5 rounded-full bg-[var(--bg-base)] border border-[var(--border-subtle)] overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-amber-200 transition-all duration-700 shadow-[0_0_8px_var(--accent)]"
              style={{ width: `${missionProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Primary 3-Column Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: CONTINUE LEARNING */}
        <div className="p-6 rounded-2xl glass-panel border border-[var(--border-subtle)] flex flex-col justify-between hover:border-[var(--border-highlight)] transition-all">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mb-3">
              <span>CONTINUE LEARNING</span>
              <span className="text-[var(--accent)] font-semibold">{activeConcept.masteryScore}% Mastery</span>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
              {activeConcept.title}
            </h3>
            <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-4">
              {activeConcept.description}
            </p>

            <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] mb-4 text-xs font-mono text-[var(--text-secondary)]">
              <span className="text-[10px] text-[var(--text-muted)] block mb-1">Guiding Equation:</span>
              <MathRenderer math={activeConcept.canonicalFormulas[0]?.latex || 'F = ma'} />
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onStartLesson(activeConcept.id, 'tutor');
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] hover:border-[var(--accent)] text-xs font-medium text-[var(--text-primary)] transition-all"
          >
            <span>Enter Socratic Workspace</span>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--accent)]" />
          </button>
        </div>

        {/* Card 2: SUBJECT MASTERY */}
        <div className="p-6 rounded-2xl glass-panel border border-[var(--border-subtle)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mb-3">
              <span>SUBJECT MASTERY</span>
              <button
                onClick={() => onNavigate('mastery')}
                className="text-[var(--accent)] hover:underline text-[11px]"
              >
                View Map &rarr;
              </button>
            </div>

            <div className="space-y-3.5">
              {subjectMastery.map((item) => (
                <div key={item.subject} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)] font-medium">{item.subject}</span>
                    <span className="font-mono text-xs text-[var(--text-primary)] font-semibold">{item.mastery}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[var(--bg-base)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                      style={{ width: `${item.mastery}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
            <span>Overall Independence:</span>
            <span className="text-[var(--accent)] font-semibold">{profile.independenceScore}%</span>
          </div>
        </div>

        {/* Card 3: STUDY STREAK & STATS */}
        <div className="p-6 rounded-2xl glass-panel border border-[var(--border-subtle)] flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono text-[var(--text-muted)] mb-3">
              INTELLECTUAL STAMINA
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-1">
                  <Flame className="w-4 h-4 fill-amber-400/20" />
                  <span>Streak</span>
                </div>
                <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                  {profile.streak} <span className="text-xs text-[var(--text-muted)] font-normal">days</span>
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Best: {profile.longestStreak} days</div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-1.5 text-sky-400 text-xs font-semibold mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Time</span>
                </div>
                <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                  {profile.minutesStudied} <span className="text-xs text-[var(--text-muted)] font-normal">min</span>
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{profile.questionsAttempted} problems</div>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Questions solved independently:</span>
              <span className="font-mono font-semibold text-[var(--accent)]">{profile.questionsSolvedIndependently}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('progress')}
            className="w-full mt-4 text-center text-xs text-[var(--accent)] hover:underline font-mono"
          >
            Open 365-Day Activity Heatmap &rarr;
          </button>
        </div>
      </div>

      {/* WEAK AREAS & DAILY CHALLENGE ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WEAK AREAS AUTO-DIAGNOSED */}
        <div className="p-6 rounded-2xl glass-panel border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider font-mono">
                Misconceptions & Weak Areas
              </h3>
            </div>
            <span className="text-[11px] font-mono dark:text-amber-400 text-amber-800 px-2 py-0.5 rounded dark:bg-amber-950/30 bg-amber-50 dark:border-amber-900/40 border-amber-200 font-medium">
              Needs Review
            </span>
          </div>

          {weakAreas.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-xl">
              No active misconceptions detected. All verified models intact.
            </div>
          ) : (
            <div className="space-y-3">
              {weakAreas.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl border border-amber-500/30 dark:bg-amber-950/10 bg-amber-50/70 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">{m.concept}</div>
                    <p className="text-xs dark:text-amber-200/90 text-amber-900 font-serif-academic italic mt-0.5">
                      "{m.misconception}"
                    </p>
                    <span className="text-[10px] font-mono text-[var(--text-muted)] mt-1 block">
                      Triggered {m.frequency}× &middot; Severity: {m.severity}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      sound.playClick();
                      onStartLesson('phys_newton_third', 'tutor');
                    }}
                    className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] text-[11px] font-semibold hover:opacity-90 transition-all"
                  >
                    <span>Remediate</span>
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DAILY CHALLENGE & MODES */}
        <div className="p-6 rounded-2xl glass-panel border border-[var(--border-subtle)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[var(--accent)]" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider font-mono">
                  Daily Thought Experiment
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[var(--accent)]">Level: Challenging</span>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs leading-relaxed text-[var(--text-secondary)] mb-4">
              <p className="font-medium text-[var(--text-primary)] mb-1">
                The Inward Pull of Accelerated Rotation
              </p>
              <div className="font-serif-academic italic text-[var(--text-muted)]">
                <MathRenderer text="A bead slides frictionless along a spoke of a wheel rotating at constant angular velocity $\omega$. What fictitious force does an observer on the wheel feel, and what real force must prevent it from sliding off?" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onStartLesson('phys_kinematics', 'practice');
              }}
              className="flex-1 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold text-center hover:opacity-90 shadow-[0_0_15px_var(--accent-glow)] transition-all"
            >
              Accept Daily Challenge
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onLaunchBossFight();
              }}
              className="px-4 py-2.5 rounded-xl border border-red-500/40 dark:bg-red-950/20 bg-red-50 hover:bg-red-100 dark:hover:bg-red-950/40 dark:text-red-200 text-red-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Boss Fight</span>
            </button>
          </div>
        </div>
      </div>

      {/* SIX STUDY MODES LAUNCHPAD */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--text-primary)] font-display-title">
            Adaptive Study Environments
          </h2>
          <span className="text-xs text-[var(--text-muted)] font-mono">6 Specialized Modes</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { id: 'tutor', name: 'Tutor Mode', desc: 'Guided Socratic ladder', icon: Brain },
            { id: 'practice', name: 'Practice Mode', desc: 'Minimal scaffolding', icon: Sparkles },
            { id: 'exam', name: 'Exam Mode', desc: 'Timed zero-hint rigor', icon: Shield },
            { id: 'deep-dive', name: 'Deep Dive', desc: 'First-principles origin', icon: Layers },
            { id: 'rapid-review', name: 'Rapid Review', desc: 'Spaced repetition sprint', icon: RotateCcw },
            { id: 'boss-fight', name: 'Boss Fight', desc: 'Multi-concept gauntlet', icon: Trophy },
          ].map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  sound.playClick();
                  if (mode.id === 'boss-fight') onLaunchBossFight();
                  else onStartLesson(activeConcept.id, mode.id);
                }}
                className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent)] hover:bg-[var(--bg-surface-elevated)] text-left transition-all group"
              >
                <div className="p-2 rounded-lg bg-[var(--bg-base)] text-[var(--accent)] w-fit mb-2 group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-[var(--text-primary)]">{mode.name}</div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{mode.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RECENT ACHIEVEMENTS CAROUSEL */}
      <div className="p-6 rounded-2xl glass-panel border border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider font-mono">
              Intellectual Milestones
            </h3>
          </div>
          <button
            onClick={() => onNavigate('progress')}
            className="text-xs text-[var(--accent)] hover:underline font-mono"
          >
            All Achievements &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {achievements.slice(0, 3).map((ach) => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-xl border text-left flex items-start gap-3 ${
                ach.unlockedAt
                  ? 'border-[var(--accent)]/30 bg-[var(--accent)]/10'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] opacity-50'
              }`}
            >
              <div className="p-2 rounded-lg bg-[var(--bg-base)] text-[var(--accent)]">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[var(--text-primary)]">{ach.title}</div>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{ach.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
