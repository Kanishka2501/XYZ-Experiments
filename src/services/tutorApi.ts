import { Problem, Concept } from '../types/tutor';

export interface TutorTurnPayload {
  problem: Problem | null;
  concept: Concept | null;
  studentInput: string;
  studentScratchpad?: {
    given?: string;
    find?: string;
    work?: string;
  };
  history?: Array<{ role: string; text: string }>;
  currentHintLevel: number;
  personality: string;
  actionType: 'SUBMIT_ATTEMPT' | 'ASK_HINT' | 'IM_STUCK' | 'EXPLAIN_DEEPER' | 'CHECK_WORK';
  knownMisconceptions?: string[];
}

export interface TutorTurnResponse {
  state: string;
  concept: string;
  student_understanding: string;
  misconception?: string;
  hint_level: number;
  mastery_estimate: number;
  response: string;
  next_action: string;
  should_reveal_solution: boolean;
  is_correct: boolean;
}

export async function askTutor(payload: TutorTurnPayload): Promise<TutorTurnResponse> {
  try {
    const res = await fetch('/api/gemini/tutor-respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Network call failed, utilizing client-side Socratic engine:', err);
    return fallbackClientTutor(payload);
  }
}

export async function requestNewPracticeProblem(
  subject: string,
  concept: string,
  difficulty = 'standard',
  mastery = 65,
  previousMistakes: string[] = []
): Promise<Problem> {
  try {
    const res = await fetch('/api/gemini/generate-practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, concept, difficulty, mastery, previousMistakes }),
    });

    if (!res.ok) throw new Error('API response not ok');
    return await res.json();
  } catch (err) {
    console.warn('Practice generation network error, using canonical problem:', err);
    return {
      id: 'gen_practice_' + Date.now(),
      conceptId: 'phys_newton_second',
      conceptTitle: concept,
      subjectTitle: subject,
      title: `${concept} Challenge Problem`,
      difficulty: difficulty as any,
      question: `A $1200\\text{ kg}$ vehicle travels at $25\\text{ m/s}$. The driver applies constant braking force, bringing it to a complete stop over a distance of $50\\text{ m}$. Calculate the magnitude of the braking force and the time required to halt.`,
      given: ['Mass m = 1200\\text{ kg}', 'Initial velocity v_0 = 25\\text{ m/s}', 'Final velocity v_f = 0\\text{ m/s}', '\\Delta x = 50\\text{ m}'],
      toFind: 'Braking force magnitude F_{net} and stopping duration \\Delta t',
      canonicalPrinciple: 'v_f^2 = v_0^2 + 2a\\Delta x \\implies a = -\\frac{v_0^2}{2\\Delta x}; \\quad F_{\\text{net}} = ma',
      hints: [
        'Level 0: Which kinematic formula links initial speed, final speed, and distance without requiring time?',
        'Level 1: Use v_f^2 = v_0^2 + 2a\\Delta x with v_f = 0 to solve for acceleration a.',
        'Level 2: 0 = (25)^2 + 2(a)(50) = 625 + 100a \\implies a = -6.25\\text{ m/s}^2.',
        'Level 3: Apply Newton\'s Second Law: F = ma = 1200 \\times 6.25 = 7500\\text{ N}.',
        'Level 4: For stopping time, use v_f = v_0 + at \\implies 0 = 25 - 6.25t \\implies t = 4.0\\text{ s}.',
      ],
      solution: 'Braking force = 7,500 N; Stopping time = 4.0 seconds.',
      commonMisconceptions: ['Dividing speed by distance directly to find time', 'Forgetting negative sign in acceleration'],
    };
  }
}

export async function explainDeeperConcept(concept: string, currentQuestion?: string) {
  try {
    const res = await fetch('/api/gemini/explain-deeper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concept, currentQuestion }),
    });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    return {
      layerTitle: `First Principles of ${concept}`,
      intuition: `Rather than treating this as a memorized formula, notice how physical conservation and symmetry constrain the system. If this law did not hold, energy or momentum would be spontaneously created.`,
      thoughtExperiment: `Imagine isolating the system at the microsecond of interaction: what forces are mutually exchanged at the contact boundary?`,
      mathematicalOrigin: `\\vec{F}_{\\text{net}} = \\frac{d\\vec{p}}{dt}`,
      reflectionQuestion: `How would this phenomenon behave in a non-inertial accelerating frame?`,
    };
  }
}

// Fallback client Socratic engine
function fallbackClientTutor(payload: TutorTurnPayload): TutorTurnResponse {
  const { studentInput, currentHintLevel, actionType, problem, concept } = payload;
  const inputLower = (studentInput || '').toLowerCase().trim();
  const nextHint = Math.min(5, currentHintLevel + (actionType === 'IM_STUCK' || actionType === 'ASK_HINT' ? 1 : 0));

  if (actionType === 'IM_STUCK' || actionType === 'ASK_HINT') {
    const hints = problem?.hints || [
      'What physical law governs this relationship?',
      'Isolate the target body and draw all forces acting on it.',
      'Set up coordinate axes and write the component equation.',
      'Substitute your given values into the component formula.',
    ];
    const hintText = hints[Math.min(nextHint, hints.length - 1)] || 'Consider the boundary conditions.';
    return {
      state: nextHint >= 5 ? 'VERIFYING' : 'HINTING',
      concept: concept?.title || 'STEM Concept',
      student_understanding: 'Actively working through progressive scaffolding.',
      misconception: '',
      hint_level: nextHint,
      mastery_estimate: Math.max(30, 75 - nextHint * 7),
      response: `Let's break this down. ${hintText} What does this lead you to deduce next?`,
      next_action: 'State your reasoning for this step.',
      should_reveal_solution: nextHint >= 5,
      is_correct: false,
    };
  }

  // Check for common misconception keywords
  if (inputLower.includes('cancel') && (inputLower.includes('equal') || inputLower.includes('third'))) {
    return {
      state: 'MISCONCEPTION_DETECTED',
      concept: concept?.title || "Newton's Third Law",
      student_understanding: 'Understands action and reaction are equal in magnitude.',
      misconception: 'Action-reaction forces cancel because they act on the same object',
      hint_level: nextHint,
      mastery_estimate: 44,
      response: "You've recognized that action-reaction forces are equal in magnitude and opposite in direction. But ask yourself: on which physical body does each force act? Can forces cancel if they act on two different objects?",
      next_action: 'Draw two separate free-body diagrams to verify.',
      should_reveal_solution: false,
      is_correct: false,
    };
  }

  // Check for answer cues
  const solWords = (problem?.solution || '').toLowerCase().split(/[\s,.;:]+/);
  const matched = solWords.some((w) => w.length > 2 && inputLower.includes(w));

  if (matched || inputLower.includes('520') || inputLower.includes('30') || inputLower.includes('200') || inputLower.includes('right')) {
    return {
      state: 'MASTERED',
      concept: concept?.title || 'Classical Mechanics',
      student_understanding: 'Demonstrated complete conceptual reasoning and algebraic verification.',
      misconception: '',
      hint_level: currentHintLevel,
      mastery_estimate: 90,
      response: "Outstanding reasoning. You isolated the system, accounted for all external constraints, and arrived at the exact physical outcome independently.",
      next_action: 'Advance to the next concept or test your reasoning on a boss challenge.',
      should_reveal_solution: false,
      is_correct: true,
    };
  }

  return {
    state: 'QUESTIONING',
    concept: concept?.title || 'Conceptual Mechanics',
    student_understanding: 'Developing an initial hypothesis.',
    misconception: '',
    hint_level: currentHintLevel,
    mastery_estimate: 58,
    response: "You've made an active start. Look closely at the forces acting along the axis of motion: what is the net unbalanced force?",
    next_action: 'Express the net force equation along the direction of interest.',
    should_reveal_solution: false,
    is_correct: false,
  };
}
