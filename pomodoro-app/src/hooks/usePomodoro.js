import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { formatTime, getNextSessionMode } from '../utils/timerUtils.js';
import { sound } from '../utils/audio.js';

const STORAGE_KEY_SETTINGS = 'pomodoro_settings_v1';
const STORAGE_KEY_STATS = 'pomodoro_stats_v1';
const STORAGE_KEY_TASKS = 'pomodoro_tasks_v1';

export const DEFAULT_SETTINGS = {
  focusTime: 25, // minutes
  shortBreakTime: 5,
  longBreakTime: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundEnabled: true,
  theme: 'default', // 'default', 'forest', 'cyber', 'sunset'
};

export const DEFAULT_STATS = {
  completedFocusCount: 0,
  totalFocusMinutes: 0,
  dailyHistory: {}, // e.g. { '2026-08-03': { focusCount: 4, focusMinutes: 100 } }
};

export function usePomodoro() {
  // 1. Settings
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  // 2. Mode: 'focus' | 'shortBreak' | 'longBreak'
  const [mode, setMode] = useState('focus');

  // 3. Stats
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATS);
      return saved ? { ...DEFAULT_STATS, ...JSON.parse(saved) } : DEFAULT_STATS;
    } catch (e) {
      return DEFAULT_STATS;
    }
  });

  // 4. Tasks
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      return saved ? JSON.parse(saved) : [
        { id: '1', title: '대표님의 핵심 프로젝트 기획하기 🚀', estPomodoros: 4, actPomodoros: 0, completed: false }
      ];
    } catch (e) {
      return [];
    }
  });
  const [activeTaskId, setActiveTaskId] = useState(() => tasks[0]?.id || null);

  // 5. Timer state
  const getInitialTimeForMode = (m, s) => {
    if (m === 'focus') return s.focusTime * 60;
    if (m === 'shortBreak') return s.shortBreakTime * 60;
    if (m === 'longBreak') return s.longBreakTime * 60;
    return 25 * 60;
  };

  const [timeLeft, setTimeLeft] = useState(() => getInitialTimeForMode(mode, settings));
  const [isRunning, setIsRunning] = useState(false);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  // Update timer duration when settings or mode change (if not running)
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(getInitialTimeForMode(mode, settings));
    }
  }, [mode, settings.focusTime, settings.shortBreakTime, settings.longBreakTime]);

  // Document Title Sync
  useEffect(() => {
    const label = mode === 'focus' ? '🎯 Focus' : mode === 'shortBreak' ? '☕ Short Break' : '🌴 Long Break';
    document.title = `${formatTime(timeLeft)} - ${label} | Pomodoro`;
  }, [timeLeft, mode]);

  // Main Timer Interval
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSessionCompletion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, settings, activeTaskId]);

  // Session Completion Handler
  const handleSessionCompletion = () => {
    setIsRunning(false);

    if (mode === 'focus') {
      // Play Sound
      if (settings.soundEnabled) sound.playSessionComplete();

      // Confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Update Stats
      const today = new Date().toISOString().split('T')[0];
      setStats((prev) => {
        const todayData = prev.dailyHistory[today] || { focusCount: 0, focusMinutes: 0 };
        return {
          ...prev,
          completedFocusCount: prev.completedFocusCount + 1,
          totalFocusMinutes: prev.totalFocusMinutes + settings.focusTime,
          dailyHistory: {
            ...prev.dailyHistory,
            [today]: {
              focusCount: todayData.focusCount + 1,
              focusMinutes: todayData.focusMinutes + settings.focusTime,
            }
          }
        };
      });

      // Increment active task completed pomodoros
      if (activeTaskId) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === activeTaskId
              ? { ...task, actPomodoros: task.actPomodoros + 1 }
              : task
          )
        );
      }

      // Next Session Mode
      const nextMode = getNextSessionMode(mode, stats.completedFocusCount, settings.longBreakInterval);
      setMode(nextMode);
      setTimeLeft(getInitialTimeForMode(nextMode, settings));

      if (settings.autoStartBreaks) {
        setIsRunning(true);
      }
    } else {
      // Break completion
      if (settings.soundEnabled) sound.playBreakComplete();

      setMode('focus');
      setTimeLeft(getInitialTimeForMode('focus', settings));

      if (settings.autoStartFocus) {
        setIsRunning(true);
      }
    }
  };

  // Actions
  const toggleTimer = () => {
    if (settings.soundEnabled) sound.playClick();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    if (settings.soundEnabled) sound.playClick();
    setIsRunning(false);
    setTimeLeft(getInitialTimeForMode(mode, settings));
  };

  const switchMode = (newMode) => {
    if (settings.soundEnabled) sound.playClick();
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(getInitialTimeForMode(newMode, settings));
  };

  const skipSession = () => {
    if (settings.soundEnabled) sound.playClick();
    handleSessionCompletion();
  };

  // Fast forward 10s for quick debugging & testing
  const fastForwardTest = () => {
    setTimeLeft((prev) => Math.max(3, prev - 300)); // skip 5 mins
  };

  return {
    mode,
    timeLeft,
    totalDuration: getInitialTimeForMode(mode, settings),
    isRunning,
    settings,
    stats,
    tasks,
    activeTaskId,
    setSettings,
    setTasks,
    setActiveTaskId,
    toggleTimer,
    resetTimer,
    switchMode,
    skipSession,
    fastForwardTest,
  };
}
