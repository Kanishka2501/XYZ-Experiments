import React, { useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  ThemeId,
  Concept,
  MisconceptionRecord,
  Achievement,
  SpacedReviewItem,
  ActivityDay,
  TutorMode,
} from './types/tutor';
import { StorageService } from './services/storageService';
import { sound } from './services/soundService';

import { Navbar } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { OnboardingModal } from './components/OnboardingModal';
import { DiagnosticView } from './components/DiagnosticView';
import { DashboardView } from './components/DashboardView';
import { TutorWorkspace } from './components/TutorWorkspace';
import { BossFightView } from './components/BossFightView';
import { MasteryMapView } from './components/MasteryMapView';
import { ProgressView } from './components/ProgressView';
import { CommandPalette } from './components/CommandPalette';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  // Theme & Mode Initialization
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => StorageService.getTheme());
  const [currentMode, setCurrentMode] = useState<'dark' | 'light'>(() => StorageService.getThemeMode());

  // Navigation View State
  // 'landing' | 'diagnostic' | 'dashboard' | 'learn' | 'practice' | 'review' | 'mastery' | 'boss-fight' | 'progress'
  const [view, setView] = useState<string>('landing');

  // Focus Mode State (Full-Screen Immersive Workspace)
  const [focusMode, setFocusMode] = useState<boolean>(false);

  // Active Lesson Context
  const [activeConceptId, setActiveConceptId] = useState<string>('phys_newton_second');
  const [tutorMode, setTutorMode] = useState<TutorMode>('tutor');

  // User Profile & Core Data
  const [profile, setProfile] = useState<UserProfile>(() => StorageService.getProfile());
  const [concepts, setConcepts] = useState<Concept[]>(() => StorageService.getConcepts());
  const [misconceptions, setMisconceptions] = useState<MisconceptionRecord[]>(() =>
    StorageService.getMisconceptions()
  );
  const [achievements, setAchievements] = useState<Achievement[]>(() =>
    StorageService.getAchievements()
  );
  const [spacedReview, setSpacedReview] = useState<SpacedReviewItem[]>(() =>
    StorageService.getSpacedReview()
  );
  const [activityHistory, setActivityHistory] = useState<ActivityDay[]>(() =>
    StorageService.getActivityHistory()
  );

  // Modals
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Apply theme attributes to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.setAttribute('data-mode', currentMode);
    if (currentMode === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [currentTheme, currentMode]);

  // Fullscreen browser helper
  const handleToggleFocusMode = useCallback(() => {
    sound.playClick();
    setFocusMode((prev) => {
      const next = !prev;
      // If turning on focus mode, switch to learn view if not already there
      if (next && view !== 'learn') {
        setView('learn');
      }

      // Try browser native fullscreen
      try {
        if (next) {
          if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        } else {
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        }
      } catch {}

      return next;
    });
  }, [view]);

  // Global keyboard shortcuts (Ctrl+Shift+F for Focus Mode, Ctrl+K for Command Palette, Esc for exit focus)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus mode: Ctrl+Shift+F or Cmd+Shift+F
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key.toLowerCase() === 'f' || e.code === 'KeyF')) {
        e.preventDefault();
        e.stopPropagation();
        handleToggleFocusMode();
        return;
      }

      // Exit focus mode on Escape
      if (e.key === 'Escape' && focusMode) {
        setFocusMode(false);
        try {
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        } catch {}
        return;
      }

      // Command palette: Ctrl+K or Cmd+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [focusMode, handleToggleFocusMode]);

  // Listen to browser fullscreen change event (e.g. if user presses browser Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && focusMode) {
        setFocusMode(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [focusMode]);

  const handleThemeChange = (newTheme: ThemeId) => {
    setCurrentTheme(newTheme);
    StorageService.saveTheme(newTheme);
  };

  const handleModeChange = (newMode: 'dark' | 'light') => {
    setCurrentMode(newMode);
    StorageService.saveThemeMode(newMode);
  };

  const handleStartLesson = (conceptId: string, mode: string = 'tutor') => {
    setActiveConceptId(conceptId);
    setTutorMode(mode as TutorMode);
    setView('learn');
  };

  const handleMasteryUpdate = (conceptId: string, newScore: number) => {
    StorageService.updateConceptMastery(conceptId, newScore);
    setConcepts(StorageService.getConcepts());
    setProfile(StorageService.getProfile());
    setMisconceptions(StorageService.getMisconceptions());
    setAchievements(StorageService.getAchievements());
  };

  const handleEnterFromLanding = () => {
    if (!profile.initialDiagnosticDone) {
      setShowOnboarding(true);
    } else {
      setView('dashboard');
    }
  };

  const handleOnboardingComplete = (updatedProfile: UserProfile, startDiagnostic: boolean) => {
    setProfile(updatedProfile);
    setShowOnboarding(false);
    if (startDiagnostic) {
      setView('diagnostic');
    } else {
      setView('dashboard');
    }
  };

  const handleResetProgress = () => {
    StorageService.resetAllData();
    setProfile(StorageService.getProfile());
    setConcepts(StorageService.getConcepts());
    setMisconceptions(StorageService.getMisconceptions());
    setAchievements(StorageService.getAchievements());
    setSpacedReview(StorageService.getSpacedReview());
    setActivityHistory(StorageService.getActivityHistory());
  };

  return (
    <div className={`min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300 ${focusMode ? 'h-screen overflow-hidden' : ''}`}>
      {/* Top Navbar visible in all views except pure Landing, Diagnostic, OR when in Focus Mode */}
      {view !== 'landing' && view !== 'diagnostic' && !focusMode && (
        <Navbar
          currentView={view}
          onNavigate={(targetView) => {
            sound.playClick();
            if (targetView === 'practice') {
              setTutorMode('practice');
              setView('learn');
            } else if (targetView === 'review') {
              // Load the first weak or spaced repetition concept
              const due = spacedReview[0]?.conceptId || 'phys_newton_third';
              setActiveConceptId(due);
              setTutorMode('tutor');
              setView('learn');
            } else {
              setView(targetView);
            }
          }}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
          currentMode={currentMode}
          onModeChange={handleModeChange}
          onOpenCommandPalette={() => setShowCommandPalette(true)}
          onOpenSettings={() => setShowSettings(true)}
          profile={profile}
        />
      )}

      {/* Main Content Router */}
      <div
        className={
          focusMode
            ? 'w-full h-screen p-0 m-0 overflow-hidden'
            : view === 'landing' || view === 'diagnostic'
            ? ''
            : 'max-w-7xl mx-auto px-4 sm:px-8 py-6'
        }
      >
        {view === 'landing' && (
          <LandingView
            onEnter={handleEnterFromLanding}
            onExploreDiagnostic={() => {
              sound.playClick();
              setView('diagnostic');
            }}
          />
        )}

        {view === 'diagnostic' && (
          <DiagnosticView
            onComplete={(recommendedId) => {
              setActiveConceptId(recommendedId);
              setTutorMode('tutor');
              setView('learn');
            }}
            onExit={() => setView('dashboard')}
          />
        )}

        {view === 'dashboard' && (
          <DashboardView
            profile={profile}
            concepts={concepts}
            misconceptions={misconceptions}
            achievements={achievements}
            spacedReview={spacedReview}
            onStartLesson={handleStartLesson}
            onNavigate={(navTarget) => {
              if (navTarget === 'practice') {
                setTutorMode('practice');
                setView('learn');
              } else {
                setView(navTarget);
              }
            }}
            onLaunchBossFight={() => setView('boss-fight')}
          />
        )}

        {view === 'learn' && (
          <TutorWorkspace
            initialConceptId={activeConceptId}
            initialMode={tutorMode}
            focusMode={focusMode}
            onToggleFocusMode={handleToggleFocusMode}
            onExit={() => {
              if (focusMode) setFocusMode(false);
              setView('dashboard');
            }}
            onMasteryUpdate={handleMasteryUpdate}
          />
        )}

        {view === 'boss-fight' && (
          <BossFightView
            onExit={() => setView('dashboard')}
            onVictory={() => {
              setProfile(StorageService.getProfile());
              setAchievements(StorageService.getAchievements());
            }}
          />
        )}

        {view === 'mastery' && (
          <MasteryMapView
            concepts={concepts}
            onSelectConcept={(cid) => {
              setActiveConceptId(cid);
              setTutorMode('tutor');
              setView('learn');
            }}
            onExit={() => setView('dashboard')}
          />
        )}

        {view === 'progress' && (
          <ProgressView
            profile={profile}
            concepts={concepts}
            misconceptions={misconceptions}
            achievements={achievements}
            spacedReview={spacedReview}
            activityHistory={activityHistory}
            onStartReview={(cid) => {
              setActiveConceptId(cid);
              setTutorMode('tutor');
              setView('learn');
            }}
          />
        )}
      </div>

      {/* Global Modals */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigate={(navTarget) => {
          if (navTarget === 'settings') {
            setShowSettings(true);
          } else if (navTarget === 'practice') {
            setTutorMode('practice');
            setView('learn');
          } else {
            setView(navTarget);
          }
        }}
        onToggleFocusMode={handleToggleFocusMode}
        onOpenThemeModal={() => setShowSettings(true)}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        profile={profile}
        currentTheme={currentTheme}
        currentMode={currentMode}
        onUpdateProfile={(updated) => setProfile(updated)}
        onUpdateTheme={handleThemeChange}
        onUpdateMode={handleModeChange}
        onResetProgress={handleResetProgress}
      />
    </div>
  );
}
