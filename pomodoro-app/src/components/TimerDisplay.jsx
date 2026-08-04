import React from 'react';
import { formatTime, calculateProgress } from '../utils/timerUtils.js';
import { Flame, Coffee, Palmtree } from 'lucide-react';

export function TimerDisplay({ mode, timeLeft, totalDuration, onSwitchMode, isRunning, activeTask }) {
  const progress = calculateProgress(timeLeft, totalDuration);

  // SVG Circular progress math
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const modeConfigs = {
    focus: {
      label: 'Focus Time',
      koLabel: '🎯 몰입 집중 💖',
      icon: Flame,
      colorClass: 'text-rose-500',
      strokeColor: '#f43f5e',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    shortBreak: {
      label: 'Short Break',
      koLabel: '☕ 짧은 휴식 🌸',
      icon: Coffee,
      colorClass: 'text-emerald-400',
      strokeColor: '#10b981',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    longBreak: {
      label: 'Long Break',
      koLabel: '🌴 긴 휴식 ✨',
      icon: Palmtree,
      colorClass: 'text-sky-400',
      strokeColor: '#38bdf8',
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    },
  };

  const currentConfig = modeConfigs[mode] || modeConfigs.focus;
  const IconComponent = currentConfig.icon;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300 border border-white/10">

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/80 rounded-2xl mb-6 border border-white/10 shadow-inner">
        <button
          onClick={() => onSwitchMode('focus')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            mode === 'focus'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="w-4 h-4 fill-current text-rose-200" />
          <span>집중 💖 (25m)</span>
        </button>

        <button
          onClick={() => onSwitchMode('shortBreak')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            mode === 'shortBreak'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Coffee className="w-4 h-4 text-emerald-200" />
          <span>휴식 🌸 (5m)</span>
        </button>

        <button
          onClick={() => onSwitchMode('longBreak')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            mode === 'longBreak'
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/40 scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palmtree className="w-4 h-4 text-sky-200" />
          <span>긴 휴식 ✨ (15m)</span>
        </button>
      </div>

      {/* Circular Timer Visual */}
      <div className="relative flex items-center justify-center my-4">
        <svg className="w-72 h-72 sm:w-80 sm:h-80 -rotate-90 transform drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">
          {/* Track Circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            className="stroke-slate-800/80"
            strokeWidth="14"
            fill="transparent"
          />
          {/* Animated Progress Circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={currentConfig.strokeColor}
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Content: Mode Badge & Big Digital Time */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          {/* Mode Badge */}
          <div className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border ${currentConfig.badgeBg} mb-2 shadow-md backdrop-blur-md`}>
            <IconComponent className="w-3.5 h-3.5 fill-current" />
            <span>{currentConfig.koLabel}</span>
          </div>

          {/* Large Digital Clock */}
          <div className="font-mono text-6xl sm:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_0_20px_rgba(244,63,94,0.5)] select-none">
            {formatTime(timeLeft)}
          </div>

          {/* Active Task Indicator */}
          {activeTask && (
            <div className="mt-3 max-w-[220px] truncate text-xs text-rose-200 flex items-center gap-1.5 bg-slate-900/80 px-3 py-1 rounded-full border border-rose-500/30 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="truncate font-medium">{activeTask.title}</span>
            </div>
          )}
        </div>
      </div>

      {/* Subtitle Status */}
      <p className="mt-2 text-xs font-semibold text-slate-400 flex items-center gap-1">
        {isRunning ? '⏱️ 몰입 타이머 신나게 달리는 중 💖' : '⏸️ 일시정지 상태 (시작 버튼을 눌러주세요 🌸)'}
      </p>
    </div>
  );
}
