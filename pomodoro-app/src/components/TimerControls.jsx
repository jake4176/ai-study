import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Zap } from 'lucide-react';

export function TimerControls({ isRunning, onToggle, onReset, onSkip, onFastForward }) {
  // Global Keyboard Shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        onToggle();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onReset();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        onSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggle, onReset, onSkip]);

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      {/* Primary Control Buttons */}
      <div className="flex items-center gap-4">
        {/* Reset Button */}
        <button
          onClick={onReset}
          className="p-4 rounded-2xl glass-panel text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-200 border border-white/10 shadow-md"
          title="타이머 초기화 (단축키: R)"
        >
          <RotateCcw className="w-6 h-6" />
        </button>

        {/* Main Start/Pause Button */}
        <button
          onClick={onToggle}
          className={`flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-extrabold text-lg text-white shadow-2xl transform active:scale-95 transition-all duration-200 ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'
              : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/40 animate-pulse-slow'
          }`}
          title="시작 / 일시정지 (단축키: Space)"
        >
          {isRunning ? (
            <>
              <Pause className="w-7 h-7 fill-current" />
              <span>일시정지</span>
            </>
          ) : (
            <>
              <Play className="w-7 h-7 fill-current ml-1" />
              <span>몰입 시작 💖</span>
            </>
          )}
        </button>

        {/* Skip Button */}
        <button
          onClick={onSkip}
          className="p-4 rounded-2xl glass-panel text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-200 border border-white/10 shadow-md"
          title="다음 세션으로 건너뛰기 (단축키: S)"
        >
          <SkipForward className="w-6 h-6" />
        </button>
      </div>

      {/* Fast Forward & Keyboard Shortcuts Legend */}
      <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
        <button
          onClick={onFastForward}
          className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold px-2 py-1 rounded-lg hover:bg-amber-500/10 transition-colors"
          title="테스트용 5분 스킵"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>테스트 5분 스킵 ⚡</span>
        </button>
        <span className="text-slate-600">|</span>
        <span>단축키: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">Space</kbd> 시작 · <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">R</kbd> 리셋</span>
      </div>
    </div>
  );
}
