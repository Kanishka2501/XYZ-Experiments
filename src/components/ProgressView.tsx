import React, { useState } from 'react';
import { UserProfile, Concept, MisconceptionRecord, Achievement, SpacedReviewItem, ActivityDay } from '../types/tutor';
import { StorageService } from '../services/storageService';
import { sound } from '../services/soundService';
import {
  BarChart3,
  Calendar,
  Flame,
  Clock,
  Sparkles,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Brain,
  Atom,
} from 'lucide-react';

interface ProgressViewProps {
  profile: UserProfile;
  concepts: Concept[];
  misconceptions: MisconceptionRecord[];
  achievements: Achievement[];
  spacedReview: SpacedReviewItem[];
  activityHistory: ActivityDay[];
  onStartReview: (conceptId: string) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  profile,
  concepts,
  misconceptions,
  achievements,
  spacedReview,
  activityHistory,
  onStartReview,
}) => {
  const [selectedDay, setSelectedDay] = useState<ActivityDay | null>(null);

  // Calculate high-level stats
  const masteredConceptsCount = concepts.filter((c) => c.status === 'mastered').length;
  const developingConceptsCount = concepts.filter((c) => c.status === 'developing' || c.status === 'learning').length;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
            <h1 className="text-xl sm:text-2xl font-bold font-display-title text-[var(--text-primary)]">
              Cognitive Analytics & Retention
            </h1>
          </div>
          <p className="font-serif-academic italic text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            “True mastery is measured not by speed, but by independent reasoning and durability over time.”
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-muted)]">
          <span>Independence: <strong className="text-[var(--accent)]">{profile.independenceScore}%</strong></span>
          <span>&middot;</span>
          <span>Total Solved: <strong className="text-[var(--text-primary)]">{profile.questionsAttempted}</strong></span>
        </div>
      </div>

      {/* 4 Macro Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-panel border border-[var(--border-subtle)]">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
            <Flame className="w-4 h-4 fill-amber-400/20" />
            <span>Streak</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            {profile.streak} <span className="text-xs text-[var(--text-muted)] font-normal">days</span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Longest: {profile.longestStreak} days</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-[var(--border-subtle)]">
          <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold mb-1">
            <Clock className="w-4 h-4" />
            <span>Study Time</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            {profile.minutesStudied} <span className="text-xs text-[var(--text-muted)] font-normal">min</span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Focus time tracked</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-[var(--border-subtle)]">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Independent</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            {profile.questionsSolvedIndependently} <span className="text-xs text-[var(--text-muted)] font-normal">problems</span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Zero hint dependence</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-[var(--border-subtle)]">
          <div className="flex items-center gap-1.5 text-xs text-[var(--accent)] font-semibold mb-1">
            <Brain className="w-4 h-4" />
            <span>Mastered</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            {masteredConceptsCount} <span className="text-xs text-[var(--text-muted)] font-normal">concepts</span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{developingConceptsCount} in active progress</div>
        </div>
      </div>

      {/* ACTIVITY HEATMAP (GitHub-style calendar grid) */}
      <div className="p-6 rounded-2xl glass-panel border border-[var(--border-subtle)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)] font-mono uppercase tracking-wider">
              Intellectual Activity Heatmap
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-muted)]">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-sm dark:bg-neutral-800 bg-neutral-200 border border-[var(--border-subtle)]" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent)]/30" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent)]/60" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent)]" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto py-2">
          <div className="flex gap-1.5 min-w-[500px]">
            {activityHistory.map((day) => {
              const count = day.count;
              let bg = 'dark:bg-neutral-800/60 bg-neutral-200/90 dark:border-neutral-700/40 border-neutral-300';
              if (count >= 5) bg = 'bg-[var(--accent)] shadow-[0_0_6px_var(--accent)]';
              else if (count >= 3) bg = 'bg-[var(--accent)]/70';
              else if (count >= 1) bg = 'bg-[var(--accent)]/35';

              return (
                <div
                  key={day.date}
                  onMouseEnter={() => setSelectedDay(day)}
                  className={`w-4 h-12 rounded-sm cursor-pointer transition-all hover:scale-110 ${bg}`}
                  title={`${day.date}: ${day.minutes} min, ${day.count} problems solved`}
                />
              );
            })}
          </div>
        </div>

        {/* Selected Day Inspector */}
        <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
          {selectedDay ? (
            <>
              <span className="text-[var(--text-primary)]">
                Date: <strong>{selectedDay.date}</strong>
              </span>
              <span className="text-[var(--text-secondary)]">
                Time: <strong>{selectedDay.minutes} min</strong> &middot; Questions: <strong>{selectedDay.count}</strong> &middot; Mastery Gained: <strong>+{selectedDay.masteryGained}%</strong>
              </span>
            </>
          ) : (
            <span className="text-[var(--text-muted)]">Hover over any day column to inspect session metrics.</span>
          )}
        </div>
      </div>

      {/* SPACED REPETITION REVIEW SCHEDULE */}
      <div className="p-6 rounded-2xl glass-panel border border-[var(--border-subtle)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)] font-mono uppercase tracking-wider">
              Adaptive Spaced Review Schedule
            </h2>
          </div>
          <span className="text-xs font-mono text-sky-400">Ebbinghaus Retention Engine</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {spacedReview.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] mb-1">
                  <span>{item.subject}</span>
                  <span className="text-sky-400">Due: {item.dueDate}</span>
                </div>
                <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-2">{item.conceptTitle}</h3>
                <div className="text-[10px] font-mono text-[var(--text-muted)]">
                  Interval: {item.intervalDays} days &middot; Reviews: {item.reviewCount}
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  onStartReview(item.conceptId);
                }}
                className="mt-4 w-full py-2 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono transition-colors"
              >
                Execute Review Sprint &rarr;
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ACHIEVEMENTS REPOSITORY */}
      <div className="p-6 rounded-2xl glass-panel border border-[var(--border-subtle)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)] font-mono uppercase tracking-wider">
              Intellectual Honors & Badges
            </h2>
          </div>
          <span className="text-xs font-mono text-[var(--accent)]">
            {achievements.filter((a) => a.unlockedAt).length} / {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {achievements.map((ach) => {
            const isUnlocked = !!ach.unlockedAt;
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'border-[var(--accent)]/40 bg-[var(--accent)]/10 shadow-[0_0_15px_var(--accent-glow)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] opacity-40'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-[var(--bg-base)] text-[var(--accent)]">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[var(--text-primary)]">{ach.title}</h3>
                    <span className="text-[10px] font-mono text-[var(--accent)]">
                      {isUnlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{ach.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
