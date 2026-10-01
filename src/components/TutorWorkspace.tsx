import React, { useState, useEffect, useRef } from 'react';
import {
  Concept,
  Problem,
  TutorMessage,
  TutorState,
  TutorMode,
  SessionSummary,
} from '../types/tutor';
import { CANONICAL_PROBLEMS } from '../services/curriculumData';
import { askTutor, requestNewPracticeProblem, explainDeeperConcept } from '../services/tutorApi';
import { StorageService } from '../services/storageService';
import { sound } from '../services/soundService';
import { MathRenderer, hasLatexPattern } from './MathRenderer';
import confetti from 'canvas-confetti';
import {
  Send,
  HelpCircle,
  Lightbulb,
  Maximize2,
  Minimize2,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Brain,
  BookOpen,
  Eye,
  EyeOff,
} from 'lucide-react';

interface TutorWorkspaceProps {
  initialConceptId?: string;
  initialMode?: TutorMode;
  focusMode?: boolean;
  onToggleFocusMode?: () => void;
  onExit: () => void;
  onMasteryUpdate: (conceptId: string, newScore: number) => void;
}

/**
 * ChatMessageItem component with intelligent LaTeX detection for AI responses.
 * Detects LaTeX patterns in AI tutor messages and formats them using MathRenderer
 * so that mathematical formulas render as professional KaTeX expressions.
 */
interface ChatMessageItemProps {
  msg: TutorMessage;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ msg }) => {
  const isTutor = msg.role === 'tutor';
  // Detect LaTeX patterns in message text (e.g. $...$, $$...$$, \[...\], \(...\), \frac, \vec, \theta, etc.)
  const hasLatex = hasLatexPattern(msg.text);

  return (
    <div
      key={msg.id}
      className={`flex flex-col ${isTutor ? 'items-start' : 'items-end'}`}
    >
      <div
        className={`max-w-[92%] sm:max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
          isTutor
            ? 'bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] shadow-sm'
            : 'bg-[var(--accent)] text-[var(--accent-contrast)] font-medium shadow-[0_0_12px_var(--accent-glow)]'
        }`}
      >
        {isTutor && (
          <div className="flex items-center justify-between gap-2 mb-1.5 text-[10px] font-mono text-[var(--accent)]">
            <div className="flex items-center gap-1.5">
              <Brain className="w-3 h-3" />
              <span className="uppercase">
                {msg.tutorState || 'Tutor Observation'}
              </span>
              {msg.hintLevel !== undefined && msg.hintLevel > 0 && (
                <span>&middot; Hint Level {msg.hintLevel}/5</span>
              )}
            </div>
            {hasLatex && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] font-semibold uppercase tracking-wider">
                LaTeX Formula
              </span>
            )}
          </div>
        )}

        {/* Detect LaTeX patterns in AI responses and wrap them with MathRenderer */}
        <MathRenderer text={msg.text} />
      </div>
      <span className="text-[10px] text-[var(--text-muted)] font-mono mt-1 px-1">
        {msg.timestamp}
      </span>
    </div>
  );
};

export const TutorWorkspace: React.FC<TutorWorkspaceProps> = ({
  initialConceptId = 'phys_newton_second',
  initialMode = 'tutor',
  focusMode: externalFocusMode,
  onToggleFocusMode,
  onExit,
  onMasteryUpdate,
}) => {
  const concepts = StorageService.getConcepts();
  const profile = StorageService.getProfile();

  // Local fallback if focusMode is not provided from props
  const [internalFocusMode, setInternalFocusMode] = useState(false);
  const isFocusMode = externalFocusMode !== undefined ? externalFocusMode : internalFocusMode;

  const handleToggleFocus = () => {
    if (onToggleFocusMode) {
      onToggleFocusMode();
    } else {
      setInternalFocusMode((prev) => !prev);
    }
  };

  const [currentConcept, setCurrentConcept] = useState<Concept>(() => {
    return concepts.find((c) => c.id === initialConceptId) || concepts[0];
  });

  const [currentProblem, setCurrentProblem] = useState<Problem>(() => {
    return (
      CANONICAL_PROBLEMS.find((p) => p.conceptId === currentConcept.id) ||
      CANONICAL_PROBLEMS[0]
    );
  });

  const [mode, setMode] = useState<TutorMode>(initialMode);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Socratic engine state machine
  const [tutorState, setTutorState] = useState<TutorState>('QUESTIONING');
  const [hintLevel, setHintLevel] = useState(0);
  const [independenceScore, setIndependenceScore] = useState(profile.independenceScore || 85);
  const [activeMisconception, setActiveMisconception] = useState<string | null>(null);

  // Scratchpad
  const [showScratchpad, setShowScratchpad] = useState(true);
  const [scratchpadWork, setScratchpadWork] = useState('');
  const [showScratchpadPreview, setShowScratchpadPreview] = useState(true);

  // Modals & Drawers
  const [showDeepDiveModal, setShowDeepDiveModal] = useState(false);
  const [deepDiveData, setDeepDiveData] = useState<any>(null);
  const [showFormulasDrawer, setShowFormulasDrawer] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionStartTime = useRef<number>(Date.now());

  // Initialize tutor greeting turn for new problem
  useEffect(() => {
    const matching = CANONICAL_PROBLEMS.find((p) => p.conceptId === currentConcept.id);
    if (matching) {
      setCurrentProblem(matching);
    }

    setHintLevel(0);
    setActiveMisconception(null);
    setTutorState('QUESTIONING');
    setScratchpadWork('');

    const initialGreeting: TutorMessage = {
      id: 'msg_' + Date.now(),
      role: 'tutor',
      text: `We are investigating **${currentConcept.title}**.\n\nTake a close look at the problem above. Before computing numbers, what physical law or boundary condition should we identify first?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hintLevel: 0,
      tutorState: 'QUESTIONING',
    };
    setMessages([initialGreeting]);
  }, [currentConcept.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Execute turn
  const handleSendTurn = async (
    actionType: 'SUBMIT_ATTEMPT' | 'ASK_HINT' | 'IM_STUCK' | 'EXPLAIN_DEEPER' | 'CHECK_WORK'
  ) => {
    const text = inputVal.trim();
    if (!text && actionType === 'SUBMIT_ATTEMPT') return;

    sound.playClick();

    let userPromptText = text;
    if (actionType === 'IM_STUCK') userPromptText = "I'm stuck. Can you give me the next conceptual clue?";
    else if (actionType === 'ASK_HINT') userPromptText = "Requesting a progressive hint.";
    else if (actionType === 'CHECK_WORK')
      userPromptText = `Please inspect my scratchpad work: "${scratchpadWork || text}"`;

    const userMessage: TutorMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      text: userPromptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputVal('');
    setIsLoading(true);

    try {
      const response = await askTutor({
        problem: currentProblem,
        concept: currentConcept,
        studentInput: userPromptText,
        studentScratchpad: {
          work: scratchpadWork,
        },
        history: messages.slice(-5).map((m) => ({ role: m.role, text: m.text })),
        currentHintLevel: hintLevel,
        personality: profile.personality,
        actionType,
        knownMisconceptions: currentProblem.commonMisconceptions || [],
      });

      // Update tutor state
      setTutorState((response.state as TutorState) || 'QUESTIONING');
      setHintLevel(response.hint_level ?? 0);

      // Manage Independence Metric
      if (actionType === 'IM_STUCK' || actionType === 'ASK_HINT') {
        sound.playHint();
        setIndependenceScore((prev) => Math.max(30, prev - 4));
      }

      // Check Misconception
      if (response.misconception) {
        setActiveMisconception(response.misconception);
        StorageService.recordMisconception(currentConcept.title, response.misconception);
      } else if (response.is_correct && activeMisconception) {
        setActiveMisconception(null);
      }

      // Add tutor message
      const tutorMessage: TutorMessage = {
        id: 'tut_' + Date.now(),
        role: 'tutor',
        text: response.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hintLevel: response.hint_level,
        tutorState: response.state as TutorState,
        misconception: response.misconception,
        isCorrect: response.is_correct,
      };

      setMessages((prev) => [...prev, tutorMessage]);

      // If correct or mastered
      if (response.is_correct || response.state === 'MASTERED') {
        sound.playCorrect();
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

        const masteryDelta = Math.min(100, Math.round(response.mastery_estimate || 85));
        onMasteryUpdate(currentConcept.id, masteryDelta);

        // Record Daily Activity
        const minutesSpent = Math.max(1, Math.round((Date.now() - sessionStartTime.current) / 60000));
        StorageService.logDailyActivity(minutesSpent, 1, 4);

        // Produce session summary
        const summary: SessionSummary = {
          id: 'sess_' + Date.now(),
          conceptTitle: currentConcept.title,
          subjectTitle: currentConcept.subjectId,
          timestamp: new Date().toISOString(),
          durationMinutes: minutesSpent,
          masteredItems: [currentProblem.title, 'Force vector balance along motion axis'],
          struggledItems: activeMisconception ? [activeMisconception] : ['Boundary conditions'],
          misconceptionsFound: activeMisconception ? [activeMisconception] : [],
          independenceScore: independenceScore,
          masteryBefore: currentConcept.masteryScore,
          masteryAfter: masteryDelta,
          nextStep: 'Advance to transfer challenge or next curriculum chapter',
        };
        StorageService.saveSession(summary);
        setSessionSummary(summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeepDive = async () => {
    sound.playClick();
    setIsLoading(true);
    try {
      const data = await explainDeeperConcept(currentConcept.title, currentProblem.question);
      setDeepDiveData(data);
      setShowDeepDiveModal(true);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextProblem = async () => {
    sound.playClick();
    setSessionSummary(null);
    setIsLoading(true);
    try {
      const newProb = await requestNewPracticeProblem(
        currentConcept.subjectId,
        currentConcept.title,
        profile.difficulty === 'gentle' ? 'foundational' : profile.difficulty === 'brutal' ? 'challenging' : 'standard',
        currentConcept.masteryScore
      );
      setCurrentProblem(newProb);
      setHintLevel(0);
      setScratchpadWork('');
      setMessages([
        {
          id: 'msg_new_' + Date.now(),
          role: 'tutor',
          text: `Here is a fresh practice problem to test your independent reasoning on **${currentConcept.title}**.\n\nState your initial approach and identify the known quantities.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          hintLevel: 0,
          tutorState: 'QUESTIONING',
        },
      ]);
    } catch {
      //
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] transition-all ${
        isFocusMode
          ? 'fixed inset-0 z-50 p-4 sm:p-8 h-screen w-screen overflow-hidden'
          : 'relative min-h-[calc(100vh-5rem)]'
      }`}
    >
      {/* 
        HEADER / NAVIGATION:
        Hidden when focusMode is true.
        When focusMode is false, standard navigation header is shown.
      */}
      {!isFocusMode ? (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-subtle)] shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onExit();
              }}
              className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors py-1.5 px-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--accent)] font-semibold">
                  {currentConcept.moduleTitle}
                </span>
                <span className="text-[var(--text-muted)]">&middot;</span>
                <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                  {currentConcept.subjectId}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-tight">
                {currentConcept.title}
              </h1>
            </div>
          </div>

          {/* Mode Selector & Controls */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 p-1 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
              {(['tutor', 'practice', 'exam', 'deep-dive'] as TutorMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    sound.playClick();
                    setMode(m);
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-colors ${
                    mode === m
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {m.replace('-', ' ')}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setShowFormulasDrawer(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              title="Formulas & Axioms"
            >
              <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="hidden md:inline">Formulas</span>
            </button>

            {/* FOCUS MODE TOGGLE BUTTON */}
            <button
              onClick={handleToggleFocus}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-highlight)] transition-all text-xs font-medium"
              title="Enter Full-Screen Focus Mode (Ctrl+Shift+F)"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="hidden sm:inline">Focus Mode</span>
            </button>
          </div>
        </div>
      ) : (
        /* Discreet floating exit focus button for immersive focus mode */
        <div className="absolute top-4 right-6 z-30 flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-surface-elevated)]/90 backdrop-blur-md border border-[var(--border-highlight)] shadow-xl text-xs">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="font-mono text-[11px] text-[var(--accent)] uppercase font-semibold">
              Focus Mode
            </span>
            <span className="text-[var(--text-muted)] font-mono text-[10px] hidden sm:inline">
              (Esc / Ctrl+Shift+F)
            </span>
          </div>

          <button
            onClick={handleToggleFocus}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--bg-surface-elevated)]/90 backdrop-blur-md border border-[var(--border-highlight)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-xl transition-all"
            title="Exit Focus Mode (Esc or Ctrl+Shift+F)"
          >
            <Minimize2 className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="font-mono text-[11px]">Exit</span>
          </button>
        </div>
      )}

      {/* 
        MAIN WORKSPACE AREA:
        - When focusMode is ACTIVE:
          Sidebar navigation is hidden.
          Navigation header is hidden.
          Analytics panels are hidden.
          The chat interface and problem workspace transition to a centered, full-screen immersive design!
        - When focusMode is INACTIVE:
          Standard 3-column layout (Sidebar navigation 3 cols, Problem & Chat 6 cols, Analytics 3 cols).
      */}
      {isFocusMode ? (
        <div className="flex-1 flex flex-col items-center justify-between max-w-4xl mx-auto w-full h-full min-h-0 overflow-hidden relative pt-2">
          {/* Centered Problem & Chat Interface */}
          <div className="flex flex-col gap-3 min-h-0 h-full w-full overflow-hidden">
            {/* Problem Statement Card */}
            <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-[var(--border-subtle)] space-y-2.5 shrink-0 shadow-lg">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent)] font-semibold">
                    {currentProblem.difficulty}
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">{currentProblem.title}</span>
                </div>
                <button
                  onClick={handleDeepDive}
                  className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 font-mono"
                >
                  <span>Deep Dive</span>
                  <Layers className="w-3 h-3" />
                </button>
              </div>

              {/* Problem text rendered using MathRenderer for LaTeX */}
              <div className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">
                <MathRenderer text={currentProblem.question} />
              </div>

              {/* Given & To Find Metadata */}
              <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)] font-mono">
                <div>
                  <span className="text-[var(--text-secondary)] font-semibold">Find: </span>
                  <MathRenderer text={currentProblem.toFind} />
                </div>
              </div>
            </div>

            {/* Student Scratchpad with Live LaTeX MathRenderer Preview */}
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 shrink-0 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <button
                  onClick={() => setShowScratchpad(!showScratchpad)}
                  className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <span>Student Reasoning Scratchpad</span>
                  <span className="text-[10px] text-[var(--accent)]">
                    {showScratchpad ? '(Collapse)' : '(Expand)'}
                  </span>
                </button>

                <div className="flex items-center gap-2">
                  {showScratchpad && scratchpadWork.trim() && (
                    <button
                      onClick={() => setShowScratchpadPreview(!showScratchpadPreview)}
                      className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] font-mono"
                      title="Toggle Live Formula Preview"
                    >
                      {showScratchpadPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>Preview</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleSendTurn('CHECK_WORK')}
                    disabled={isLoading || !scratchpadWork.trim()}
                    className="text-[11px] text-[var(--accent)] hover:underline font-mono disabled:opacity-40"
                  >
                    Inspect My Work &rarr;
                  </button>
                </div>
              </div>

              {showScratchpad && (
                <>
                  <textarea
                    value={scratchpadWork}
                    onChange={(e) => setScratchpadWork(e.target.value)}
                    placeholder="Draft your equations, free-body balance, or steps here... e.g. \Sigma F_x = T\cos(30^\circ) - f_k = ma"
                    rows={3}
                    className="w-full p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] font-mono focus:border-[var(--accent)] focus:outline-none resize-none transition-colors"
                  />

                  {/* Live LaTeX Expression Preview */}
                  {showScratchpadPreview && scratchpadWork.trim() && (
                    <div className="mt-2 p-2 rounded-lg bg-[var(--bg-base)]/70 border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                      <span className="text-[10px] font-mono text-[var(--accent)] uppercase block mb-1">
                        Rendered Mathematical Notation:
                      </span>
                      <MathRenderer text={scratchpadWork} />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Socratic Conversation Stream specifically rendering AI response messages with MathRenderer */}
            <div className="flex-1 overflow-y-auto space-y-3 p-2.5 min-h-0 rounded-xl bg-[var(--bg-surface)]/40 border border-[var(--border-subtle)] shadow-inner">
              {messages.map((msg) => (
                <ChatMessageItem key={msg.id} msg={msg} />
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono p-3 bg-[var(--bg-surface)] rounded-xl w-fit animate-pulse">
                  <Brain className="w-3.5 h-3.5 text-[var(--accent)] animate-spin" />
                  <span>Tutor analyzing reasoning path...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Socratic Hint Ladder Indicator */}
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs shrink-0">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--text-muted)]">
                <Lightbulb className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Hint Ladder:</span>
              </div>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4, 5].map((lvl) => (
                  <span
                    key={lvl}
                    className={`w-5 h-2 rounded-sm transition-all ${
                      lvl <= hintLevel
                        ? 'bg-[var(--accent)] shadow-[0_0_6px_var(--accent)]'
                        : 'bg-[var(--bg-base)] border border-[var(--border-subtle)]'
                    }`}
                    title={`Level ${lvl}`}
                  />
                ))}
              </div>
              <span className="font-mono text-[10px] text-[var(--text-muted)]">
                {hintLevel === 0 ? 'Pure Reasoning' : `Level ${hintLevel}/5`}
              </span>
            </div>

            {/* Socratic Action Toolbelt Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => handleSendTurn('IM_STUCK')}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors disabled:opacity-50"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>I'm Stuck</span>
              </button>

              <button
                onClick={() => handleSendTurn('ASK_HINT')}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors disabled:opacity-50"
              >
                <Lightbulb className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Next Hint</span>
              </button>

              <button
                onClick={handleDeepDive}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>Explain Deeper</span>
              </button>

              <button
                onClick={() => setShowFormulasDrawer(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors ml-auto"
              >
                <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Formulas</span>
              </button>
            </div>

            {/* Chat Input Area */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendTurn('SUBMIT_ATTEMPT');
              }}
              className="relative flex items-center shrink-0"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Think aloud. Show your reasoning or equations (e.g. F = ma)..."
                disabled={isLoading}
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none shadow-inner transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading || !inputVal.trim()}
                className="absolute right-2 p-2 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] disabled:opacity-30 hover:opacity-90 transition-all shadow-[0_0_10px_var(--accent-glow)]"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-hidden">
          {/* COLUMN 1: LEFT NAVIGATION & CURRICULUM TREE */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 overflow-y-auto pr-1">
            <div className="p-4 rounded-xl glass-panel border border-[var(--border-subtle)]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] block mb-2 font-semibold">
                Curriculum Track
              </span>
              <div className="space-y-1.5">
                {concepts
                  .filter((c) => c.subjectId === currentConcept.subjectId)
                  .map((c) => {
                    const isCurrent = c.id === currentConcept.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          sound.playClick();
                          setCurrentConcept(c);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                          isCurrent
                            ? 'bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] font-semibold'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] border border-transparent'
                        }`}
                      >
                        <span className="truncate">{c.title}</span>
                        <span className="font-mono text-[10px] opacity-75">{c.masteryScore}%</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-[var(--border-subtle)]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] block mb-2 font-semibold">
                Cognitive Objectives
              </span>
              <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                {currentConcept.learningObjectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[var(--accent)] mt-0.5">&bull;</span>
                    <span className="leading-relaxed">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-[var(--border-subtle)]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] block mb-2 font-semibold">
                Verified Axioms
              </span>
              <div className="space-y-2">
                {currentConcept.canonicalFormulas.map((f, i) => (
                  <div key={i} className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <div className="text-[10px] text-[var(--text-muted)] font-mono">{f.label}</div>
                    <div className="text-xs text-[var(--text-primary)] mt-0.5">
                      <MathRenderer text={f.latex} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMN 2: CENTER PROBLEM WORKSPACE & CONVERSATION STREAM */}
          <div className="col-span-12 lg:col-span-6 flex flex-col min-h-0 overflow-hidden">
            {/* Problem Statement Card */}
            <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-[var(--border-subtle)] space-y-2.5 shrink-0 shadow-lg">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent)] font-semibold">
                    {currentProblem.difficulty}
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">{currentProblem.title}</span>
                </div>
                <button
                  onClick={handleDeepDive}
                  className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 font-mono"
                >
                  <span>Deep Dive</span>
                  <Layers className="w-3 h-3" />
                </button>
              </div>

              {/* Problem text rendered using MathRenderer for LaTeX */}
              <div className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">
                <MathRenderer text={currentProblem.question} />
              </div>

              {/* Given & To Find Metadata */}
              <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)] font-mono">
                <div>
                  <span className="text-[var(--text-secondary)] font-semibold">Find: </span>
                  <MathRenderer text={currentProblem.toFind} />
                </div>
              </div>
            </div>

            {/* Student Scratchpad with Live LaTeX MathRenderer Preview */}
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 shrink-0 shadow-sm mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <button
                  onClick={() => setShowScratchpad(!showScratchpad)}
                  className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <span>Student Reasoning Scratchpad</span>
                  <span className="text-[10px] text-[var(--accent)]">
                    {showScratchpad ? '(Collapse)' : '(Expand)'}
                  </span>
                </button>

                <div className="flex items-center gap-2">
                  {showScratchpad && scratchpadWork.trim() && (
                    <button
                      onClick={() => setShowScratchpadPreview(!showScratchpadPreview)}
                      className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] font-mono"
                      title="Toggle Live Formula Preview"
                    >
                      {showScratchpadPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>Preview</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleSendTurn('CHECK_WORK')}
                    disabled={isLoading || !scratchpadWork.trim()}
                    className="text-[11px] text-[var(--accent)] hover:underline font-mono disabled:opacity-40"
                  >
                    Inspect My Work &rarr;
                  </button>
                </div>
              </div>

              {showScratchpad && (
                <>
                  <textarea
                    value={scratchpadWork}
                    onChange={(e) => setScratchpadWork(e.target.value)}
                    placeholder="Draft your equations, free-body balance, or steps here... e.g. \Sigma F_x = T\cos(30^\circ) - f_k = ma"
                    rows={2}
                    className="w-full p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] font-mono focus:border-[var(--accent)] focus:outline-none resize-none transition-colors"
                  />

                  {/* Live LaTeX Expression Preview */}
                  {showScratchpadPreview && scratchpadWork.trim() && (
                    <div className="mt-2 p-2 rounded-lg bg-[var(--bg-base)]/70 border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                      <span className="text-[10px] font-mono text-[var(--accent)] uppercase block mb-1">
                        Rendered Mathematical Notation:
                      </span>
                      <MathRenderer text={scratchpadWork} />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Socratic Conversation Stream specifically rendering AI response messages with MathRenderer */}
            <div className="flex-1 overflow-y-auto space-y-3 p-2.5 min-h-0 rounded-xl bg-[var(--bg-surface)]/40 border border-[var(--border-subtle)] shadow-inner mt-3">
              {messages.map((msg) => (
                <ChatMessageItem key={msg.id} msg={msg} />
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono p-3 bg-[var(--bg-surface)] rounded-xl w-fit animate-pulse">
                  <Brain className="w-3.5 h-3.5 text-[var(--accent)] animate-spin" />
                  <span>Tutor analyzing reasoning path...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Socratic Hint Ladder Indicator */}
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs shrink-0 mt-3">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--text-muted)]">
                <Lightbulb className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Hint Ladder:</span>
              </div>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4, 5].map((lvl) => (
                  <span
                    key={lvl}
                    className={`w-5 h-2 rounded-sm transition-all ${
                      lvl <= hintLevel
                        ? 'bg-[var(--accent)] shadow-[0_0_6px_var(--accent)]'
                        : 'bg-[var(--bg-base)] border border-[var(--border-subtle)]'
                    }`}
                    title={`Level ${lvl}`}
                  />
                ))}
              </div>
              <span className="font-mono text-[10px] text-[var(--text-muted)]">
                {hintLevel === 0 ? 'Pure Reasoning' : `Level ${hintLevel}/5`}
              </span>
            </div>

            {/* Socratic Action Toolbelt Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 mt-3">
              <button
                onClick={() => handleSendTurn('IM_STUCK')}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors disabled:opacity-50"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>I'm Stuck</span>
              </button>

              <button
                onClick={() => handleSendTurn('ASK_HINT')}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors disabled:opacity-50"
              >
                <Lightbulb className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Next Hint</span>
              </button>

              <button
                onClick={handleDeepDive}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>Explain Deeper</span>
              </button>
            </div>

            {/* Chat Input Area */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendTurn('SUBMIT_ATTEMPT');
              }}
              className="relative flex items-center shrink-0 mt-3"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Think aloud. Show your reasoning or equations (e.g. F = ma)..."
                disabled={isLoading}
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none shadow-inner transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading || !inputVal.trim()}
                className="absolute right-2 p-2 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] disabled:opacity-30 hover:opacity-90 transition-all shadow-[0_0_10px_var(--accent-glow)]"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* COLUMN 3: RIGHT TUTOR INTELLIGENCE & ANALYTICS PANEL */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 overflow-y-auto">
            <div className="p-4 rounded-xl glass-panel border border-[var(--border-subtle)]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] block mb-2 font-semibold">
                Tutor Cognition State
              </span>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
                <span className="font-mono text-xs font-semibold text-[var(--text-primary)]">
                  {tutorState}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-2 leading-relaxed">
                {tutorState === 'HINTING' && 'Providing minimal progressive scaffolding.'}
                {tutorState === 'QUESTIONING' && 'Probing student understanding with Socratic inquiry.'}
                {tutorState === 'MISCONCEPTION_DETECTED' && 'Remediating identified cognitive misconception.'}
                {tutorState === 'MASTERED' && 'Verified independent derivation.'}
                {tutorState === 'ATTEMPTING' && 'Evaluating student scratchpad logic.'}
              </p>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold">
                  Independence Score
                </span>
                <span className="font-mono text-xs font-semibold text-[var(--accent)]">
                  {independenceScore}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--bg-base)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                  style={{ width: `${independenceScore}%` }}
                />
              </div>
              <span className="text-[10px] text-[var(--text-muted)] mt-1.5 block">
                Measures reasoning without heavy hint reliance.
              </span>
            </div>

            {activeMisconception && (
              <div className="p-4 rounded-xl border dark:border-amber-500/30 border-amber-300 dark:bg-amber-950/20 bg-amber-50/90 animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-semibold dark:text-amber-400 text-amber-800 mb-1">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Misconception Diagnosed</span>
                </div>
                <p className="text-xs dark:text-amber-200/90 text-amber-900 font-serif-academic italic leading-relaxed">
                  "{activeMisconception}"
                </p>
                <div className="mt-2 text-[10px] font-mono dark:text-amber-400/80 text-amber-700">
                  Nexus is asking targeted counter-examples to disprove this premise.
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl glass-panel border border-[var(--border-subtle)]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] block mb-1 font-semibold">
                Verified Principle
              </span>
              <div className="text-xs text-[var(--text-primary)] font-mono p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] mt-1">
                <MathRenderer text={currentProblem.canonicalPrinciple} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SESSION SUMMARY MODAL */}
      {sessionSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl glass-panel-elevated shadow-2xl border border-[var(--border-highlight)] p-6 sm:p-8 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold font-display-title text-[var(--text-primary)]">
                Problem Mastered
              </h2>
              <p className="font-serif-academic italic text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                “Durable understanding achieved through independent reasoning.”
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <span className="text-[10px] text-[var(--text-muted)] block">Independence Score</span>
                <span className="text-lg font-bold text-[var(--accent)]">{sessionSummary.independenceScore}%</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <span className="text-[10px] text-[var(--text-muted)] block">Mastery Shift</span>
                <span className="text-lg font-bold text-emerald-400">
                  {sessionSummary.masteryBefore}% &rarr; {sessionSummary.masteryAfter}%
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <span className="text-[10px] font-mono text-[var(--accent)] uppercase block mb-1">
                  What You Reasoned Out:
                </span>
                <p className="text-[var(--text-secondary)]">{sessionSummary.masteredItems.join(', ')}</p>
              </div>

              {sessionSummary.misconceptionsFound.length > 0 && (
                <div className="p-3 rounded-lg dark:bg-amber-950/20 bg-amber-50/90 border dark:border-amber-900/30 border-amber-300">
                  <span className="text-[10px] font-mono dark:text-amber-400 text-amber-800 uppercase block mb-1">
                    Misconceptions Resolved:
                  </span>
                  <p className="dark:text-amber-200/90 text-amber-900 italic font-serif-academic">
                    {sessionSummary.misconceptionsFound.join(', ')}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setSessionSummary(null);
                  onExit();
                }}
                className="flex-1 py-3 rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Return to Dashboard
              </button>
              <button
                onClick={handleNextProblem}
                className="flex-1 py-3 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold hover:opacity-90 shadow-[0_0_15px_var(--accent-glow)]"
              >
                Next Problem &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEEP DIVE MODAL */}
      {showDeepDiveModal && deepDiveData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl glass-panel-elevated shadow-2xl border border-[var(--border-highlight)] p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--accent)]" />
                <h3 className="text-sm font-bold text-[var(--text-primary)] font-display-title">
                  {deepDiveData.layerTitle}
                </h3>
              </div>
              <button
                onClick={() => setShowDeepDiveModal(false)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Close &times;
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              <div>
                <span className="font-mono text-[10px] text-[var(--accent)] uppercase block mb-1">
                  First-Principles Intuition:
                </span>
                <p>{deepDiveData.intuition}</p>
              </div>

              {deepDiveData.thoughtExperiment && (
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <span className="font-mono text-[10px] text-sky-400 uppercase block mb-1">
                    Thought Experiment:
                  </span>
                  <p className="font-serif-academic italic text-[var(--text-primary)]">
                    "{deepDiveData.thoughtExperiment}"
                  </p>
                </div>
              )}

              {deepDiveData.mathematicalOrigin && (
                <div>
                  <span className="font-mono text-[10px] text-[var(--accent)] uppercase block mb-1">
                    Mathematical Invariant:
                  </span>
                  <MathRenderer text={deepDiveData.mathematicalOrigin} block />
                </div>
              )}

              {deepDiveData.reflectionQuestion && (
                <div className="p-3 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/30">
                  <span className="font-mono text-[10px] text-[var(--accent)] uppercase block mb-1">
                    Reflective Question:
                  </span>
                  <p className="font-medium text-[var(--text-primary)]">
                    {deepDiveData.reflectionQuestion}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowDeepDiveModal(false)}
              className="w-full py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold hover:opacity-90 transition-all shadow-[0_0_15px_var(--accent-glow)]"
            >
              Resume Socratic Dialogue
            </button>
          </div>
        </div>
      )}

      {/* FORMULAS CHEAT DRAWER */}
      {showFormulasDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md h-full bg-[var(--bg-surface-elevated)] border-l border-[var(--border-highlight)] p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--accent)]" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Canonical Axioms & Formulas
                </h3>
              </div>
              <button
                onClick={() => setShowFormulasDrawer(false)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Close &times;
              </button>
            </div>

            <div className="space-y-4">
              {currentConcept.canonicalFormulas.map((f, i) => (
                <div key={i} className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <div className="text-xs font-semibold text-[var(--text-primary)] mb-1">{f.label}</div>
                  <MathRenderer text={f.latex} block />
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">{f.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorWorkspace;

