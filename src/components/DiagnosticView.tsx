import React, { useState } from 'react';
import { DIAGNOSTIC_QUESTIONS } from '../services/curriculumData';
import { sound } from '../services/soundService';
import { StorageService } from '../services/storageService';
import { Compass, CheckCircle2, ArrowRight, Brain, AlertTriangle } from 'lucide-react';
import { MathRenderer } from './MathRenderer';

interface DiagnosticViewProps {
  onComplete: (recommendedConceptId: string) => void;
  onExit: () => void;
}

export const DiagnosticView: React.FC<DiagnosticViewProps> = ({ onComplete, onExit }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState<Array<{ questionId: string; optionId: string; score: number }>>([]);
  const [showProfile, setShowProfile] = useState(false);

  const currentQ = DIAGNOSTIC_QUESTIONS[currentIdx];

  const handleSelectOption = (optionId: string) => {
    if (answered) return;
    sound.playClick();
    setSelectedOption(optionId);
  };

  const handleSubmitQuestion = () => {
    if (!selectedOption) return;
    const option = currentQ.options.find((o) => o.id === selectedOption);
    const score = option ? option.score : 0;

    if (score > 0) {
      sound.playCorrect();
    } else {
      sound.playHint();
    }

    setAnswered(true);
    setAnswers((prev) => [...prev, { questionId: currentQ.id, optionId: selectedOption, score }]);
  };

  const handleNext = () => {
    sound.playClick();
    if (currentIdx + 1 < DIAGNOSTIC_QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      sound.playMastery();
      setShowProfile(true);
    }
  };

  // Profile Generation based on answer patterns
  const correctCount = answers.filter((a) => a.score > 0).length;
  const totalCount = DIAGNOSTIC_QUESTIONS.length;
  const initialMastery = Math.round((correctCount / totalCount) * 100);

  const learningProfile = {
    strong: correctCount >= 2
      ? ['Qualitative inertia principles', 'Invariance of interaction forces across mass disparities']
      : ['Qualitative physical intuition'],
    developing: [
      'Static friction boundary inequality (f_s <= mu_s * N)',
      'Vector component decomposition on tilted reference frames',
    ],
    needsAttention: correctCount < 2
      ? ["Newton's Third Law: distinguishing action-reaction from balanced single-body forces"]
      : ['Free-body force resolution under complex coupled loads'],
    recommendedStartingPoint: correctCount >= 2
      ? "Newton's Second Law: Force & Momentum"
      : "Newton's Third Law: Action & Reaction",
    recommendedConceptId: correctCount >= 2 ? 'phys_newton_second' : 'phys_newton_third',
  };

  const handleStartSession = () => {
    sound.playClick();
    const profile = StorageService.getProfile();
    profile.initialDiagnosticDone = true;
    profile.activeConceptId = learningProfile.recommendedConceptId;
    StorageService.saveProfile(profile);
    StorageService.updateConceptMastery(learningProfile.recommendedConceptId, Math.max(45, initialMastery));
    onComplete(learningProfile.recommendedConceptId);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col justify-center items-center p-4 sm:p-8">
      <div className="w-full max-w-2xl rounded-2xl glass-panel-elevated shadow-2xl border border-[var(--border-highlight)] p-6 sm:p-10 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-glow)] rounded-full blur-[90px] pointer-events-none opacity-40" />

        {!showProfile ? (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[var(--accent)]" />
                <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  Diagnostic Probe &middot; Question {currentIdx + 1} of {DIAGNOSTIC_QUESTIONS.length}
                </span>
              </div>
              <button
                onClick={onExit}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] font-mono"
              >
                Skip &rarr;
              </button>
            </div>

            {/* Concept Kicker */}
            <div className="text-xs font-mono text-[var(--accent)] uppercase tracking-wide mb-2">
              {currentQ.concept}
            </div>

            {/* Question Text */}
            <h2 className="text-base sm:text-lg font-medium text-[var(--text-primary)] leading-relaxed mb-6 font-sans tracking-normal">
              <MathRenderer text={currentQ.question} />
            </h2>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((option) => {
                const isSelected = selectedOption === option.id;
                const showFeedback = answered && isSelected;
                const isCorrect = option.score > 0;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    disabled={answered}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? answered
                          ? isCorrect
                            ? 'dark:border-emerald-500/50 border-emerald-300 dark:bg-emerald-950/20 bg-emerald-50 dark:text-emerald-200 text-emerald-800'
                            : 'dark:border-amber-500/50 border-amber-300 dark:bg-amber-950/20 bg-amber-50 dark:text-amber-200 text-amber-800'
                          : 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--text-primary)] shadow-[0_0_12px_var(--accent-glow)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-highlight)]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-xs text-[var(--accent)] font-semibold mt-0.5 uppercase tracking-normal">
                        {option.id}.
                      </span>
                      <div className="flex-1 text-xs sm:text-sm leading-relaxed tracking-normal font-sans text-[var(--text-primary)]">
                        <MathRenderer text={option.text} />
                        {showFeedback && (
                          <div className="mt-2 text-xs font-serif-academic italic text-[var(--text-secondary)] leading-relaxed tracking-normal">
                            <MathRenderer text={option.feedback} />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
              <span className="text-xs text-[var(--text-muted)] font-mono">
                {answered ? 'Thought evaluated' : 'Select your deduced answer'}
              </span>

              {!answered ? (
                <button
                  onClick={handleSubmitQuestion}
                  disabled={!selectedOption}
                  className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 shadow-[0_0_15px_var(--accent-glow)] transition-all"
                >
                  Verify Deduction
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold hover:opacity-90 shadow-[0_0_15px_var(--accent-glow)] transition-all"
                >
                  <span>{currentIdx + 1 < DIAGNOSTIC_QUESTIONS.length ? 'Next Question' : 'Synthesize Profile'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Profile Result Screen */
          <div className="space-y-6 animate-in fade-in">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[11px] font-mono text-[var(--accent)] uppercase tracking-wider mb-3">
                <Brain className="w-3.5 h-3.5" />
                <span>Diagnostic Assessment Complete</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display-title text-[var(--text-primary)]">
                YOUR LEARNING PROFILE
              </h2>
              <p className="font-serif-academic italic text-sm text-[var(--text-secondary)] mt-1">
                “Understanding begins by mapping the contours of what you don’t yet know.”
              </p>
            </div>

            <div className="space-y-3">
              {/* Strong */}
              <div className="p-4 rounded-xl border dark:border-emerald-500/20 border-emerald-300 dark:bg-emerald-950/10 bg-emerald-50">
                <div className="flex items-center gap-2 text-xs font-semibold dark:text-emerald-400 text-emerald-800 uppercase font-mono mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Demonstrated Intuition (Strong)</span>
                </div>
                <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                  {learningProfile.strong.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* Developing */}
              <div className="p-4 rounded-xl border dark:border-sky-500/20 border-sky-300 dark:bg-sky-950/10 bg-sky-50">
                <div className="flex items-center gap-2 text-xs font-semibold dark:text-sky-400 text-sky-800 uppercase font-mono mb-2">
                  <Brain className="w-3.5 h-3.5" />
                  <span>Developing Reasoning</span>
                </div>
                <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                  {learningProfile.developing.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>

              {/* Needs Attention / Misconceptions */}
              <div className="p-4 rounded-xl border dark:border-amber-500/20 border-amber-300 dark:bg-amber-950/10 bg-amber-50">
                <div className="flex items-center gap-2 text-xs font-semibold dark:text-amber-400 text-amber-800 uppercase font-mono mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Prioritized Misconception Focus</span>
                </div>
                <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                  {learningProfile.needsAttention.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Starting Point Card */}
            <div className="p-5 rounded-xl border border-[var(--accent)] bg-[var(--accent)]/10 shadow-[0_0_20px_var(--accent-glow)]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent)] font-semibold">
                Recommended Curriculum Entry
              </span>
              <h3 className="text-base font-bold text-[var(--text-primary)] mt-1">
                {learningProfile.recommendedStartingPoint}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Your first personalized Socratic session will scaffold this concept to solidify your mental model.
              </p>
            </div>

            <button
              onClick={handleStartSession}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold tracking-wider uppercase hover:opacity-90 transition-all shadow-[0_0_25px_var(--accent-glow)]"
            >
              <span>ENTER PERSONALIZED SESSIONS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
