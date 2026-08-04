import React, { useState } from 'react';
import { usePomodoro } from './hooks/usePomodoro.js';
import { Header } from './components/Header.jsx';
import { TimerDisplay } from './components/TimerDisplay.jsx';
import { TimerControls } from './components/TimerControls.jsx';
import { TaskManager } from './components/TaskManager.jsx';
import { WeeklyChart } from './components/WeeklyChart.jsx';
import { StatsModal } from './components/StatsModal.jsx';
import { SettingsModal } from './components/SettingsModal.jsx';
import { Heart, Sparkles } from 'lucide-react';

export default function App() {
  const {
    mode,
    timeLeft,
    totalDuration,
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
  } = usePomodoro();

  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 transition-colors duration-400">
      {/* Top Header */}
      <Header
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        completedCount={stats.completedFocusCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center my-6">
        <TimerDisplay
          mode={mode}
          timeLeft={timeLeft}
          totalDuration={totalDuration}
          onSwitchMode={switchMode}
          isRunning={isRunning}
          activeTask={activeTask}
        />

        <TimerControls
          isRunning={isRunning}
          onToggle={toggleTimer}
          onReset={resetTimer}
          onSkip={skipSession}
          onFastForward={fastForwardTest}
        />

        <TaskManager
          tasks={tasks}
          setTasks={setTasks}
          activeTaskId={activeTaskId}
          setActiveTaskId={setActiveTaskId}
        />

        {/* Weekly Focus Time Visualization (월화수목금토일) */}
        <WeeklyChart dailyHistory={stats.dailyHistory} />
      </main>

      {/* Encouraging Cute Footer */}
      <footer className="w-full max-w-lg mx-auto text-center py-4 border-t border-pink-500/10 text-xs text-pink-300/60 flex items-center justify-between font-medium">
        <div className="flex items-center gap-1">
          <Heart className="w-3.5 h-3.5 text-pink-400 fill-current" />
          <span>코다리 개발부장의 핫핑크 특급 보좌 🫡💖</span>
        </div>
        <div className="flex items-center gap-1 text-pink-200/80 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>대표님 오늘 하루도 대박나세요! ✨</span>
        </div>
      </footer>

      {/* Modals */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
      />
    </div>
  );
}
