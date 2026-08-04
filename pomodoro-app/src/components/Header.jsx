import React from 'react';
import { Timer, BarChart3, Settings, Sparkles } from 'lucide-react';

export function Header({ onOpenStats, onOpenSettings, completedCount }) {
  return (
    <header className="w-full max-w-4xl mx-auto flex items-center justify-between py-5 px-4">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 border border-rose-300/40 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
          <Timer className="w-6 h-6 animate-pulse-slow" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            PomoMaster <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">Pro 💖</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">AI 1인 기업가 대표님의 스마트한 몰입 파트너 🎀</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Completed Counter Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl glass-panel text-xs font-bold text-slate-300 border border-white/10 shadow-md">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>오늘 {completedCount}개 달성 💖</span>
        </div>

        {/* Stats Button */}
        <button
          onClick={onOpenStats}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-panel text-xs font-bold hover:bg-white/10 text-slate-200 transition-all duration-200 border border-white/10 shadow-md hover:scale-105"
          title="통계 및 차트 보기"
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">통계</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-panel text-xs font-bold hover:bg-white/10 text-slate-200 transition-all duration-200 border border-white/10 shadow-md hover:scale-105"
          title="타이머 설정"
        >
          <Settings className="w-4 h-4 text-sky-400" />
          <span className="hidden sm:inline">설정</span>
        </button>
      </div>
    </header>
  );
}
