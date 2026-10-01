import {
  UserProfile,
  Concept,
  MisconceptionRecord,
  SessionSummary,
  Achievement,
  SpacedReviewItem,
  ActivityDay,
  ThemeId,
} from '../types/tutor';
import { CANONICAL_CONCEPTS } from './curriculumData';

const STORAGE_KEYS = {
  PROFILE: 'nexus_user_profile',
  THEME: 'nexus_theme_id',
  THEME_MODE: 'nexus_theme_mode',
  CONCEPTS: 'nexus_concepts_mastery',
  MISCONCEPTIONS: 'nexus_misconceptions',
  SESSIONS: 'nexus_sessions',
  ACHIEVEMENTS: 'nexus_achievements',
  SPACED_REVIEW: 'nexus_spaced_review',
  ACTIVITY: 'nexus_activity_log',
  SETTINGS: 'nexus_settings',
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Rivera',
  academicLevel: 'Undergraduate',
  subjects: ['Physics', 'Mathematics'],
  learningGoal: 'Understand concepts',
  difficulty: 'challenging',
  personality: 'Calm Mentor',
  initialDiagnosticDone: false,
  streak: 5,
  longestStreak: 12,
  minutesStudied: 340,
  independenceScore: 84,
  questionsAttempted: 24,
  questionsSolvedIndependently: 19,
  hintsUsed: 14,
  lastStudyDate: new Date().toISOString().split('T')[0],
  activeSubject: 'Physics',
  activeConceptId: 'phys_newton_second',
};

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_principle',
    title: 'First Principle',
    description: 'Solved your first problem from first principles without relying on formula memorization.',
    icon: 'Atom',
    unlockedAt: '2026-09-28T14:32:00.000Z',
  },
  {
    id: 'no_hand_holding',
    title: 'No Hand-Holding',
    description: 'Reasoned through 5 consecutive questions without requesting a single hint.',
    icon: 'ShieldCheck',
    unlockedAt: '2026-09-29T19:15:00.000Z',
  },
  {
    id: 'deep_thinker',
    title: 'Deep Thinker',
    description: 'Decomposed a challenging transfer problem using Socratic inquiry.',
    icon: 'Brain',
    unlockedAt: '2026-09-30T04:10:00.000Z',
  },
  {
    id: 'comeback',
    title: 'Cognitive Comeback',
    description: 'Identified an active misconception and completely resolved it in a follow-up attempt.',
    icon: 'Sparkles',
    unlockedAt: undefined,
  },
  {
    id: 'consistency_seven',
    title: 'Seven Days of Thought',
    description: 'Maintained a focused study streak for 7 consecutive days.',
    icon: 'Flame',
    unlockedAt: undefined,
  },
  {
    id: 'boss_slayer',
    title: 'Mechanics Master',
    description: 'Defeated the Classical Mechanics Boss without revealing solutions.',
    icon: 'Trophy',
    unlockedAt: undefined,
  },
];

export const INITIAL_MISCONCEPTIONS: MisconceptionRecord[] = [
  {
    id: 'misc_1',
    concept: "Newton's Third Law: Action & Reaction",
    misconception: 'Action-reaction forces cancel because they act on the same object',
    frequency: 3,
    severity: 'high',
    lastSeen: '2026-09-29T21:40:00.000Z',
    resolved: false,
  },
  {
    id: 'misc_2',
    concept: "Newton's Second Law: Force & Momentum",
    misconception: 'Normal force is always equal to mg regardless of vertical acceleration or angles',
    frequency: 2,
    severity: 'medium',
    lastSeen: '2026-09-28T18:22:00.000Z',
    resolved: false,
  },
  {
    id: 'misc_3',
    concept: 'Kinematics & Vector Motion',
    misconception: 'Assuming acceleration must be zero at the peak of trajectory when velocity is zero',
    frequency: 1,
    severity: 'low',
    lastSeen: '2026-09-26T11:05:00.000Z',
    resolved: true,
  },
];

export const INITIAL_SPACED_REVIEW: SpacedReviewItem[] = [
  {
    id: 'rev_1',
    conceptId: 'phys_newton_third',
    conceptTitle: "Newton's Third Law: Action & Reaction",
    subject: 'Physics',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    intervalDays: 1,
    easeFactor: 2.1,
    reviewCount: 1,
  },
  {
    id: 'rev_2',
    conceptId: 'phys_friction_fbd',
    conceptTitle: 'Free-Body Diagrams & Friction',
    subject: 'Physics',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], // 3 days
    intervalDays: 3,
    easeFactor: 2.5,
    reviewCount: 2,
  },
  {
    id: 'rev_3',
    conceptId: 'phys_kinematics',
    conceptTitle: 'Kinematics & Vector Motion',
    subject: 'Physics',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], // 7 days
    intervalDays: 7,
    easeFactor: 2.6,
    reviewCount: 4,
  },
];

export class StorageService {
  static getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  }

  static saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  }

  static getTheme(): ThemeId {
    try {
      return (localStorage.getItem(STORAGE_KEYS.THEME) as ThemeId) || 'night-academia';
    } catch {
      return 'night-academia';
    }
  }

  static saveTheme(theme: ThemeId): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  }

  static getThemeMode(): 'dark' | 'light' {
    try {
      return (localStorage.getItem(STORAGE_KEYS.THEME_MODE) as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  }

  static saveThemeMode(mode: 'dark' | 'light'): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
      document.documentElement.setAttribute('data-mode', mode);
      if (mode === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      console.error('Failed to save mode', e);
    }
  }

  static getConcepts(): Concept[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONCEPTS);
      return data ? JSON.parse(data) : CANONICAL_CONCEPTS;
    } catch {
      return CANONICAL_CONCEPTS;
    }
  }

  static saveConcepts(concepts: Concept[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONCEPTS, JSON.stringify(concepts));
    } catch (e) {
      console.error('Failed to save concepts', e);
    }
  }

  static updateConceptMastery(conceptId: string, newScore: number): void {
    const concepts = this.getConcepts();
    const idx = concepts.findIndex((c) => c.id === conceptId);
    if (idx !== -1) {
      concepts[idx].masteryScore = Math.max(0, Math.min(100, Math.round(newScore)));
      if (concepts[idx].masteryScore >= 85) concepts[idx].status = 'mastered';
      else if (concepts[idx].masteryScore >= 70) concepts[idx].status = 'strong';
      else if (concepts[idx].masteryScore >= 50) concepts[idx].status = 'developing';
      else concepts[idx].status = 'learning';
      this.saveConcepts(concepts);
    }
  }

  static getMisconceptions(): MisconceptionRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MISCONCEPTIONS);
      return data ? JSON.parse(data) : INITIAL_MISCONCEPTIONS;
    } catch {
      return INITIAL_MISCONCEPTIONS;
    }
  }

  static recordMisconception(conceptTitle: string, misconceptionText: string): void {
    if (!misconceptionText) return;
    const list = this.getMisconceptions();
    const existing = list.find(
      (m) => m.concept === conceptTitle && m.misconception.toLowerCase() === misconceptionText.toLowerCase()
    );
    if (existing) {
      existing.frequency += 1;
      existing.severity = existing.frequency >= 3 ? 'high' : 'medium';
      existing.lastSeen = new Date().toISOString();
      existing.resolved = false;
    } else {
      list.unshift({
        id: 'misc_' + Date.now(),
        concept: conceptTitle,
        misconception: misconceptionText,
        frequency: 1,
        severity: 'low',
        lastSeen: new Date().toISOString(),
        resolved: false,
      });
    }
    try {
      localStorage.setItem(STORAGE_KEYS.MISCONCEPTIONS, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  }

  static resolveMisconception(id: string): void {
    const list = this.getMisconceptions();
    const item = list.find((m) => m.id === id);
    if (item) {
      item.resolved = true;
      localStorage.setItem(STORAGE_KEYS.MISCONCEPTIONS, JSON.stringify(list));
    }
  }

  static getSessions(): SessionSummary[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveSession(session: SessionSummary): void {
    try {
      const list = this.getSessions();
      list.unshift(session);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(list.slice(0, 50)));
    } catch (e) {
      console.error(e);
    }
  }

  static getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return data ? JSON.parse(data) : DEFAULT_ACHIEVEMENTS;
    } catch {
      return DEFAULT_ACHIEVEMENTS;
    }
  }

  static unlockAchievement(id: string): Achievement | null {
    const list = this.getAchievements();
    const item = list.find((a) => a.id === id);
    if (item && !item.unlockedAt) {
      item.unlockedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(list));
      return item;
    }
    return null;
  }

  static getSpacedReview(): SpacedReviewItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SPACED_REVIEW);
      return data ? JSON.parse(data) : INITIAL_SPACED_REVIEW;
    } catch {
      return INITIAL_SPACED_REVIEW;
    }
  }

  static scheduleReview(conceptId: string, conceptTitle: string, subject: string, quality: 'hard' | 'good' | 'easy'): void {
    const list = this.getSpacedReview();
    let item = list.find((r) => r.conceptId === conceptId);
    const intervals = {
      hard: 1,
      good: 3,
      easy: 7,
    };
    const daysToAdd = intervals[quality] || 2;
    const dueDate = new Date(Date.now() + daysToAdd * 86400000).toISOString().split('T')[0];

    if (item) {
      item.dueDate = dueDate;
      item.intervalDays = daysToAdd;
      item.reviewCount += 1;
    } else {
      list.push({
        id: 'rev_' + Date.now(),
        conceptId,
        conceptTitle,
        subject,
        dueDate,
        intervalDays: daysToAdd,
        easeFactor: 2.5,
        reviewCount: 1,
      });
    }
    try {
      localStorage.setItem(STORAGE_KEYS.SPACED_REVIEW, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  }

  static getActivityHistory(): ActivityDay[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
      if (data) return JSON.parse(data);
    } catch {}

    // Generate realistic 60-day historical activity log
    const history: ActivityDay[] = [];
    const today = new Date();
    for (let i = 59; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const hasStudied = i === 0 || i % 2 === 0 || (i >= 10 && i <= 16);
      history.push({
        date: dateStr,
        count: hasStudied ? Math.floor(Math.random() * 6) + 1 : 0,
        minutes: hasStudied ? Math.floor(Math.random() * 45) + 15 : 0,
        masteryGained: hasStudied ? Math.floor(Math.random() * 8) + 2 : 0,
      });
    }
    return history;
  }

  static logDailyActivity(minutes: number, questions = 1, masteryGain = 2): void {
    const history = this.getActivityHistory();
    const todayStr = new Date().toISOString().split('T')[0];
    const todayEntry = history.find((h) => h.date === todayStr);

    if (todayEntry) {
      todayEntry.minutes += minutes;
      todayEntry.count += questions;
      todayEntry.masteryGained += masteryGain;
    } else {
      history.push({
        date: todayStr,
        count: questions,
        minutes,
        masteryGained: masteryGain,
      });
    }
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(history.slice(-180)));
    } catch (e) {
      console.error(e);
    }
  }

  static exportAllData(): string {
    const backup = {
      profile: this.getProfile(),
      theme: this.getTheme(),
      themeMode: this.getThemeMode(),
      concepts: this.getConcepts(),
      misconceptions: this.getMisconceptions(),
      sessions: this.getSessions(),
      achievements: this.getAchievements(),
      spacedReview: this.getSpacedReview(),
      activity: this.getActivityHistory(),
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    return JSON.stringify(backup, null, 2);
  }

  static importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile));
      if (data.theme) localStorage.setItem(STORAGE_KEYS.THEME, data.theme);
      if (data.themeMode) localStorage.setItem(STORAGE_KEYS.THEME_MODE, data.themeMode);
      if (data.concepts) localStorage.setItem(STORAGE_KEYS.CONCEPTS, JSON.stringify(data.concepts));
      if (data.misconceptions) localStorage.setItem(STORAGE_KEYS.MISCONCEPTIONS, JSON.stringify(data.misconceptions));
      if (data.sessions) localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(data.sessions));
      if (data.achievements) localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(data.achievements));
      if (data.spacedReview) localStorage.setItem(STORAGE_KEYS.SPACED_REVIEW, JSON.stringify(data.spacedReview));
      if (data.activity) localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(data.activity));
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  static resetAllData(): void {
    const existingProfile = this.getProfile();
    const cleanProfile: UserProfile = {
      ...existingProfile,
      streak: 0,
      longestStreak: 0,
      minutesStudied: 0,
      independenceScore: 100,
      questionsAttempted: 0,
      questionsSolvedIndependently: 0,
      hintsUsed: 0,
      initialDiagnosticDone: false,
    };

    const freshConcepts = CANONICAL_CONCEPTS.map((c) => ({
      ...c,
      masteryScore: c.order === 1 ? 20 : 0,
      status: (c.order === 1 ? 'learning' : 'locked') as Concept['status'],
      attemptsCount: 0,
      successCount: 0,
      lastPracticed: undefined,
    }));

    const freshAchievements = DEFAULT_ACHIEVEMENTS.map((a) => ({
      ...a,
      unlockedAt: undefined,
    }));

    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(cleanProfile));
      localStorage.setItem(STORAGE_KEYS.CONCEPTS, JSON.stringify(freshConcepts));
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(freshAchievements));
      localStorage.setItem(STORAGE_KEYS.MISCONCEPTIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.SPACED_REVIEW, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify([]));
    } catch (e) {
      console.error('Reset all data failed:', e);
    }
  }
}
