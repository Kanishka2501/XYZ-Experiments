import React, { useState } from 'react';
import { UserProfile, AcademicLevel, LearningGoal, DifficultyLevel, TutorPersonality } from '../types/tutor';
import { StorageService } from '../services/storageService';
import { sound } from '../services/soundService';
import { ArrowRight, Check, Compass, Sparkles } from 'lucide-react';
import { NexusLogo } from './NexusLogo';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile, startDiagnostic: boolean) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>('Undergraduate');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Physics', 'Mathematics']);
  const [learningGoal, setLearningGoal] = useState<LearningGoal>('Understand concepts');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('challenging');
  const [personality, setPersonality] = useState<TutorPersonality>('Calm Mentor');

  if (!isOpen) return null;

  const academicLevels: AcademicLevel[] = [
    'Middle School',
    'High School',
    'Undergraduate',
    'Competitive Exam',
    'Self-Learner',
  ];

  const subjectsList = [
    'Physics',
    'Mathematics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'Economics',
    'History',
  ];

  const learningGoals: LearningGoal[] = [
    'Understand concepts',
    'Prepare for exams',
    'Solve difficult problems',
    'Build fundamentals',
    'Master a subject',
  ];

  const difficulties: { id: DifficultyLevel; name: string; desc: string }[] = [
    { id: 'gentle', name: 'Gentle', desc: 'Frequent clues, forgiving pace, step-by-step encouragement.' },
    { id: 'balanced', name: 'Balanced', desc: 'Moderate scaffolding, standard inquiry, checks assumptions.' },
    { id: 'challenging', name: 'Challenging', desc: 'Minimal hints, probes edge cases, expects independent deduction.' },
    { id: 'brutal', name: 'Brutal', desc: 'Zero hints until multiple failed proofs. Extreme rigor.' },
  ];

  const personalities: { id: TutorPersonality; name: string; desc: string }[] = [
    { id: 'Calm Mentor', name: 'Calm Mentor', desc: 'Patient, methodical, asks grounding questions, never rushes.' },
    { id: 'Strict Coach', name: 'Strict Coach', desc: 'Direct, focused on eliminating lazy guesswork, demands proofs.' },
    { id: 'Friendly Professor', name: 'Friendly Professor', desc: 'Curious, loves historical thought experiments, builds deep analogies.' },
    { id: 'Quiet Guide', name: 'Quiet Guide', desc: 'Sparse interventions, speaks only when critical, maximum quiet thinking.' },
    { id: 'High-Standards Mentor', name: 'High-Standards Mentor', desc: 'Celebrates only genuine breakthroughs, uncompromising precision.' },
  ];

  const toggleSubject = (s: string) => {
    sound.playClick();
    if (selectedSubjects.includes(s)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((item) => item !== s));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, s]);
    }
  };

  const handleFinish = (startDiagnostic: boolean) => {
    sound.playMastery();
    const current = StorageService.getProfile();
    const updated: UserProfile = {
      ...current,
      name: name.trim() || 'Learner',
      academicLevel,
      subjects: selectedSubjects,
      learningGoal,
      difficulty,
      personality,
      initialDiagnosticDone: !startDiagnostic,
      activeSubject: selectedSubjects[0] || 'Physics',
    };
    StorageService.saveProfile(updated);
    onComplete(updated, startDiagnostic);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl glass-panel-elevated shadow-2xl border border-[var(--border-highlight)] p-6 sm:p-8 overflow-hidden">
        {/* Step indicator */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4 mb-6">
          <NexusLogo size="sm" />
          <div className="flex items-center gap-1.5 font-mono text-xs text-[var(--accent)]">
            <span>STEP {step} OF 3</span>
          </div>
        </div>

        {/* Step 1: Identity & Level */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-xl font-bold font-display-title text-[var(--text-primary)]">
                Welcome to Nexus Tutor
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Tell us who you are and where your intellectual frontier lies.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider font-mono">
                Your Name or Call-Sign
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex, Marie, Feynman..."
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider font-mono">
                Academic Tier
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {academicLevels.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setAcademicLevel(lvl);
                    }}
                    className={`p-2.5 rounded-xl border text-xs text-center transition-all ${
                      academicLevel === lvl
                        ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] font-medium shadow-[0_0_10px_var(--accent-glow)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-highlight)]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider font-mono">
                Target Subjects (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {subjectsList.map((subj) => (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => toggleSubject(subj)}
                    className={`px-3 py-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${
                      selectedSubjects.includes(subj)
                        ? 'border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)] font-medium'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-highlight)]'
                    }`}
                  >
                    {selectedSubjects.includes(subj) && <Check className="w-3 h-3 text-[var(--accent)]" />}
                    <span>{subj}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setStep(2);
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold hover:opacity-90 transition-all shadow-[0_0_15px_var(--accent-glow)]"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Learning Goals & Challenge Rigor */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-xl font-bold font-display-title text-[var(--text-primary)]">
                Learning Objectives & Rigor
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                How demanding should the Socratic tutor be with your reasoning?
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider font-mono">
                Primary Goal
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {learningGoals.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setLearningGoal(goal);
                    }}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      learningGoal === goal
                        ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] font-medium'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-highlight)]'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider font-mono">
                Preferred Difficulty
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {difficulties.map((diff) => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setDifficulty(diff.id);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      difficulty === diff.id
                        ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--text-primary)] font-medium shadow-[0_0_10px_var(--accent-glow)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:border-[var(--border-highlight)]'
                    }`}
                  >
                    <div className="text-xs font-semibold text-[var(--text-primary)]">{diff.name}</div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{diff.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setStep(1);
                }}
                className="px-4 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setStep(3);
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold hover:opacity-90 transition-all shadow-[0_0_15px_var(--accent-glow)]"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Tutor Persona & First Step */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-xl font-bold font-display-title text-[var(--text-primary)]">
                Tutor Personality
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Choose the intellectual demeanor of your AI mentor.
              </p>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2">
                {personalities.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setPersonality(p.id);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      personality === p.id
                        ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--text-primary)] shadow-[0_0_10px_var(--accent-glow)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:border-[var(--border-highlight)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--text-primary)]">{p.name}</span>
                      {personality === p.id && <Check className="w-3.5 h-3.5 text-[var(--accent)]" />}
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
              <button
                type="button"
                onClick={() => handleFinish(true)}
                className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold hover:opacity-90 transition-all shadow-[0_0_20px_var(--accent-glow)]"
              >
                <Compass className="w-4 h-4" />
                <span>START 3-QUESTION DIAGNOSTIC ("Find Out How You Think")</span>
              </button>

              <button
                type="button"
                onClick={() => handleFinish(false)}
                className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Skip diagnostic & go directly to Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
