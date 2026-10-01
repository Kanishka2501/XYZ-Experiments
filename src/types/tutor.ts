export type ThemeId =
  | 'night-academia'
  | 'midnight'
  | 'aurora'
  | 'oxford'
  | 'sakura'
  | 'crimson'
  | 'arctic';

export type TutorMode =
  | 'tutor'
  | 'practice'
  | 'exam'
  | 'deep-dive'
  | 'rapid-review'
  | 'boss-fight';

export type TutorState =
  | 'DIAGNOSING'
  | 'TEACHING'
  | 'QUESTIONING'
  | 'ATTEMPTING'
  | 'HINTING'
  | 'MISCONCEPTION_DETECTED'
  | 'RETRYING'
  | 'VERIFYING'
  | 'MASTERED'
  | 'REVIEW_REQUIRED';

export type TutorPersonality =
  | 'Calm Mentor'
  | 'Strict Coach'
  | 'Friendly Professor'
  | 'Quiet Guide'
  | 'High-Standards Mentor';

export type DifficultyLevel = 'gentle' | 'balanced' | 'challenging' | 'brutal';

export type AcademicLevel =
  | 'Middle School'
  | 'High School'
  | 'Undergraduate'
  | 'Competitive Exam'
  | 'Self-Learner';

export type LearningGoal =
  | 'Understand concepts'
  | 'Prepare for exams'
  | 'Solve difficult problems'
  | 'Build fundamentals'
  | 'Master a subject';

export interface Concept {
  id: string;
  subjectId: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  description: string;
  order: number;
  prerequisites: string[];
  learningObjectives: string[];
  canonicalFormulas: { label: string; latex: string; explanation: string }[];
  commonMisconceptions: string[];
  masteryScore: number; // 0 to 100
  status: 'locked' | 'learning' | 'developing' | 'strong' | 'mastered';
}

export interface Problem {
  id: string;
  conceptId: string;
  conceptTitle: string;
  subjectTitle: string;
  title: string;
  question: string;
  difficulty: 'foundational' | 'guided' | 'standard' | 'challenging' | 'transfer';
  given: string[];
  toFind: string;
  canonicalPrinciple: string;
  hints: string[]; // Ladder from Level 0 to Level 4
  solution: string; // Revealed only at Level 5
  commonMisconceptions: string[];
}

export interface MisconceptionRecord {
  id: string;
  concept: string;
  misconception: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high';
  lastSeen: string; // ISO date
  resolved: boolean;
}

export interface UserProfile {
  name: string;
  academicLevel: AcademicLevel;
  subjects: string[];
  learningGoal: LearningGoal;
  difficulty: DifficultyLevel;
  personality: TutorPersonality;
  initialDiagnosticDone: boolean;
  streak: number;
  longestStreak: number;
  minutesStudied: number;
  independenceScore: number; // Percentage
  questionsAttempted: number;
  questionsSolvedIndependently: number;
  hintsUsed: number;
  lastStudyDate: string;
  activeSubject: string;
  activeConceptId: string;
}

export interface TutorMessage {
  id: string;
  role: 'user' | 'tutor' | 'system';
  text: string;
  timestamp: string;
  hintLevel?: number;
  tutorState?: TutorState;
  misconception?: string;
  isCorrect?: boolean;
  diagnosedWeakness?: string;
}

export interface SessionSummary {
  id: string;
  conceptTitle: string;
  subjectTitle: string;
  timestamp: string;
  durationMinutes: number;
  masteredItems: string[];
  struggledItems: string[];
  misconceptionsFound: string[];
  independenceScore: number;
  masteryBefore: number;
  masteryAfter: number;
  nextStep: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface SpacedReviewItem {
  id: string;
  conceptId: string;
  conceptTitle: string;
  subject: string;
  dueDate: string; // ISO date
  intervalDays: number;
  easeFactor: number;
  reviewCount: number;
}

export interface ActivityDay {
  date: string; // YYYY-MM-DD
  count: number; // Number of questions/events
  minutes: number;
  masteryGained: number;
}
