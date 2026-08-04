import React from 'react';
import { X, Heart, Clock, Sparkles, Calendar } from 'lucide-react';
import { WeeklyChart } from './WeeklyChart.jsx';

export function StatsModal({ isOpen, onClose, stats }) {
  if (!isOpen) return null;

  const totalHours = (stats.totalFocusMinutes / 60).toFixed(1);
  const historyEntries = Object.entries(stats.dailyHistory || {}).sort((a, b) => (a[0] < b[0] ? 1 : -1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-extrabold text-white">몰입 성과 종합 리포트 ✨</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Stat Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center text-center">
            <Heart className="w-6 h-6 text-rose-500 fill-current mb-1 animate-pulse" />
            <span className="text-2xl font-extrabold text-white">{stats.completedFocusCount}개</span>
            <span className="text-xs text-slate-400 font-medium mt-0.5">달성한 뽀모도로</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center text-center">
            <Clock className="w-6 h-6 text-sky-400 mb-1" />
            <span className="text-2xl font-extrabold text-white">{totalHours}시간</span>
            <span className="text-xs text-slate-400 font-medium mt-0.5">누적 몰입 시간</span>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="mb-6">
          <WeeklyChart dailyHistory={stats.dailyHistory} />
        </div>

        {/* Daily History List */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>최근 일일 달성 히스토리 🌸</span>
          </h3>

          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {historyEntries.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-500 font-medium">
                아직 달성한 뽀모도로 세션이 없어요 💖 지금 바로 첫 세션을 시작해 볼까요?
              </p>
            ) : (
              historyEntries.slice(0, 7).map(([dateStr, data]) => (
                <div
                  key={dateStr}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs font-medium"
                >
                  <span className="font-mono text-slate-300">{dateStr}</span>
                  <div className="flex items-center gap-3 font-bold">
                    <span className="text-rose-400">🍅 {data.focusCount}회</span>
                    <span className="text-slate-400">⏱️ {data.focusMinutes}분</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
