import React, { useState } from 'react';
import { ArrowRight, Compass, ShieldAlert, Cpu, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { NexusLogo } from './NexusLogo';
import { sound } from '../services/soundService';

interface LandingViewProps {
  onEnter: () => void;
  onExploreDiagnostic: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onEnter, onExploreDiagnostic }) => {
  const [activePrinciple, setActivePrinciple] = useState(0);

  const principles = [
    {
      num: '01',
      title: 'PRODUCTIVE STRUGGLE',
      tagline: 'Learning happens at the boundary of confusion.',
      description: 'When you are handed the solution, your brain assumes it understood. Nexus Tutor holds back the answer, guiding you to build the neural pathways yourself through active intellectual struggle.',
      contrast: 'Chatbot dumps the formula -> Nexus asks what variable connects your knowns.',
    },
    {
      num: '02',
      title: 'ADAPTIVE SCAFFOLDING',
      tagline: 'The Hint Ladder: small, surgical interventions.',
      description: 'Never binary hints. We use a 5-tier scaffold: from a gentle orienting question (Level 0) to conceptual clues, principle pointers, and structural breakdowns, preserving maximum student autonomy.',
      contrast: 'No binary spoilers -> calibrated rungs of support.',
    },
    {
      num: '03',
      title: 'VERIFIED KNOWLEDGE',
      tagline: 'Anti-hallucination guardrails grounded in first principles.',
      description: 'Separating canonical laws and teacher-verified definitions from generative conversational hints. The tutor never fabricates formulas, and reasons strictly from verified STEM axioms.',
      contrast: 'No fabricated formulas -> canonical physics & math corpus.',
    },
    {
      num: '04',
      title: 'MASTERY LEARNING',
      tagline: 'Independence over simple correct answers.',
      description: 'A student who solves an equation after seeing the answer does not receive the same mastery score as someone who deduced it independently. Our mastery model penalizes hint reliance and tracks transfer.',
      contrast: 'Mastery = Accuracy × Independence × Misconception Resolution.',
    },
    {
      num: '05',
      title: 'YOUR PACE',
      tagline: 'No artificial timers or cognitive overload.',
      description: 'Every interaction delivers one observation, one idea, and one question. Progressive disclosure ensures you never drown in textbook paragraphs.',
      contrast: 'Observation + One Idea + One Question.',
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden selection:bg-[var(--accent)]/30">
      {/* Cinematic ambient background glow and subtle grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[var(--accent-glow)] rounded-full blur-[140px] opacity-40 animate-pulse duration-1000" />
        <div className="absolute top-[40%] -right-40 w-[500px] h-[500px] bg-[var(--accent)]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-[var(--accent)]/15 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute inset-0 bg-grain opacity-70" />
      </div>

      {/* Top minimal header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <NexusLogo size="md" />
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              sound.playClick();
              onExploreDiagnostic();
            }}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1.5 px-3 rounded-lg border border-transparent hover:border-[var(--border-subtle)]"
          >
            Diagnostic Test
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onEnter();
            }}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 shadow-[0_0_20px_var(--accent-glow)] transition-all"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero section */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto px-6 pt-16 pb-24 flex flex-col items-center text-center">
        {/* Editorial Subtitle Kicker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[11px] font-mono text-[var(--accent)] uppercase tracking-widest mb-6">
          <Sparkles className="w-3 h-3 text-[var(--accent)]" />
          <span>Socratic AI Tutoring Architecture</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-display-title text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.08] max-w-4xl">
          NEXUS <span className="font-serif-academic italic font-normal text-[var(--accent)]">TUTOR</span>
        </h1>

        <p className="font-serif-academic italic text-2xl sm:text-3xl text-[var(--text-secondary)] mt-4 font-light max-w-2xl">
          “Don’t memorize. Understand.”
        </p>

        <p className="text-sm sm:text-base text-[var(--text-muted)] mt-6 max-w-xl leading-relaxed">
          An AI tutor designed to teach you how to think — not simply what to answer.
          Master physics, mathematics, and STEM through active Socratic inquiry, progressive scaffolding, and durable intuition.
        </p>

        {/* Call to action buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
          <button
            onClick={() => {
              sound.playClick();
              onEnter();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold text-sm shadow-[0_0_30px_var(--accent-glow)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>ENTER THE TUTOR</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onExploreDiagnostic();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-highlight)] font-medium text-sm transition-all"
          >
            <Compass className="w-4 h-4 text-[var(--accent)]" />
            <span>FIND OUT HOW YOU THINK</span>
          </button>
        </div>

        {/* Comparison Showcase: Socratic vs Lazy AI */}
        <div className="w-full max-w-3xl mt-20 p-6 rounded-2xl glass-panel text-left">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4">
            <span className="text-xs uppercase tracking-wider font-mono text-[var(--text-muted)]">
              Pedagogical Paradigm
            </span>
            <span className="text-xs text-[var(--accent)] font-medium">Why Nexus is Different</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl dark:bg-red-950/20 bg-red-50/90 dark:border-red-900/30 border-red-200 text-xs">
              <div className="flex items-center gap-2 dark:text-red-400 text-red-700 font-semibold mb-2">
                <ShieldAlert className="w-4 h-4" />
                <span>Generic AI Chatbot</span>
              </div>
              <p className="dark:text-red-200/80 text-red-900 italic mb-2">Student: "What's the acceleration of the box?"</p>
              <p className="dark:text-neutral-400 text-neutral-700 leading-relaxed">
                "Here is the answer: a = 3.5 m/s². Plug in F = ma where F = 70 N..."
              </p>
              <p className="mt-3 text-[11px] dark:text-red-400/90 text-red-700 font-mono">
                Result: Zero retention. Creates false illusion of competence.
              </p>
            </div>

            <div className="p-4 rounded-xl dark:bg-emerald-950/20 bg-emerald-50/90 dark:border-emerald-900/30 border-emerald-200 text-xs">
              <div className="flex items-center gap-2 dark:text-emerald-400 text-emerald-700 font-semibold mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Nexus Socratic Tutor</span>
              </div>
              <p className="dark:text-emerald-200/80 text-emerald-900 italic mb-2">Student: "What's the acceleration of the box?"</p>
              <p className="dark:text-neutral-300 text-neutral-700 leading-relaxed">
                "Let's earn it together. Before calculating the final number: what horizontal force opposes the forward pull?"
              </p>
              <p className="mt-3 text-[11px] dark:text-emerald-400/90 text-emerald-700 font-mono">
                Result: Builds durable mental model and independent problem-solving skill.
              </p>
            </div>
          </div>
        </div>

        {/* The Five Principles Interactive Section */}
        <div className="w-full max-w-4xl mt-24">
          <div className="text-center mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent)]">
              Core Architecture
            </span>
            <h2 className="font-display-title text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
              Five Foundational Principles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6">
            {principles.map((p, idx) => (
              <button
                key={p.num}
                onClick={() => {
                  sound.playClick();
                  setActivePrinciple(idx);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activePrinciple === idx
                    ? 'border-[var(--accent)] bg-[var(--accent)]/15 shadow-[0_0_15px_var(--accent-glow)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-highlight)]'
                }`}
              >
                <div className="text-xs font-mono text-[var(--accent)] font-semibold">{p.num}</div>
                <div className="text-xs font-medium text-[var(--text-primary)] mt-1 truncate">{p.title}</div>
              </button>
            ))}
          </div>

          <div className="p-6 rounded-2xl glass-panel-elevated text-left">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono text-[var(--accent)] px-2 py-0.5 rounded bg-[var(--accent)]/20">
                {principles[activePrinciple].num}
              </span>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                {principles[activePrinciple].title}
              </h3>
            </div>
            <p className="font-serif-academic italic text-sm text-[var(--text-secondary)] mb-3">
              "{principles[activePrinciple].tagline}"
            </p>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              {principles[activePrinciple].description}
            </p>
            <div className="p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span className="font-mono text-[11px] text-[var(--accent)]">Design Invariant:</span>
              <span>{principles[activePrinciple].contrast}</span>
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-20 p-8 rounded-2xl border border-[var(--border-highlight)] bg-gradient-to-b from-[var(--bg-surface-elevated)] to-[var(--bg-surface)] max-w-2xl w-full">
          <p className="font-serif-academic italic text-lg text-[var(--text-secondary)] mb-2">
            “The AI doesn't do the thinking for you. It helps you become better at thinking.”
          </p>
          <p className="text-xs text-[var(--text-muted)] mb-6">
            Begin your journey into durable understanding.
          </p>
          <button
            onClick={() => {
              sound.playClick();
              onEnter();
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold tracking-wider uppercase hover:opacity-90 shadow-[0_0_20px_var(--accent-glow)] transition-all"
          >
            <span>Start Learning Session</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      <footer className="relative z-10 border-t border-[var(--border-subtle)] py-6 text-center text-xs text-[var(--text-muted)] font-mono">
        Nexus Tutor &copy; {new Date().getFullYear()} &mdash; Socratic Cognition Engine
      </footer>
    </div>
  );
};
