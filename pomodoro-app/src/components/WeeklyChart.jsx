import React from 'react';
import { getCurrentWeekDays } from '../utils/timerUtils.js';
import { BarChart2, Flame, Sparkles } from 'lucide-react';

export function WeeklyChart({ dailyHistory }) {
  const weekDays = getCurrentWeekDays(dailyHistory);

  const totalWeeklyMinutes = weekDays.reduce((acc, d) => acc + d.minutes, 0);
  const maxMinutes = Math.max(...weekDays.map((d) => d.minutes), 60);

  const peakDay = [...weekDays].sort((a, b) => b.minutes - a.minutes)[0];

  return (
    <div className="w-full max-w-lg mx-auto glass-panel rounded-3xl p-6 mt-8 border border-white/10 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
              <span>이번 주 요일별 몰입 시간 💖</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">월~일 집중 시간 한눈에 보기</p>
          </div>
        </div>

        {/* Weekly Total Badge */}
        <div className="flex flex-col items-end">
          <span className="text-xs text-slate-400 font-semibold">이번 주 총 몰입</span>
          <span className="text-sm font-extrabold text-white flex items-center gap-1">
            <Flame className="w-4 h-4 text-rose-500 fill-current animate-pulse" />
            <span>{Math.floor(totalWeeklyMinutes / 60)}시간 {totalWeeklyMinutes % 60}분</span>
          </span>
        </div>
      </div>

      {/* Bar Chart Bars Container */}
      <div className="pt-4 pb-2 px-2 flex items-end justify-between gap-2 h-44 border-b border-slate-800/60">
        {weekDays.map((day) => {
          const heightPercent = maxMinutes > 0 ? Math.round((day.minutes / maxMinutes) * 100) : 0;
          const displayHeight = day.minutes > 0 ? Math.max(heightPercent, 12) : 6;

          return (
            <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-2 group relative">
              {/* Tooltip on Hover */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-700 whitespace-nowrap shadow-xl pointer-events-none z-10">
                {day.minutes > 0 ? `💖 ${day.minutes}분 (${day.count}세션)` : '기록 없음'}
              </div>

              {/* Minute value label over bar */}
              <span className="text-[10px] font-bold text-slate-400">
                {day.minutes > 0 ? `${day.minutes}m` : '-'}
              </span>

              {/* Bar Fill */}
              <div className="w-full max-w-[32px] bg-slate-900/60 rounded-t-xl h-28 flex items-end p-0.5 border border-slate-800">
                <div
                  style={{ height: `${displayHeight}%` }}
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    day.isToday
                      ? 'bg-gradient-to-t from-rose-600 via-rose-500 to-amber-400 shadow-lg shadow-rose-500/40 animate-pulse'
                      : day.minutes > 0
                      ? 'bg-gradient-to-t from-slate-700 via-rose-600 to-rose-400 opacity-90 group-hover:opacity-100'
                      : 'bg-slate-800/40'
                  }`}
                />
              </div>

              {/* Day Label (월, 화, 수, 목, 금, 토, 일) */}
              <div className="flex flex-col items-center">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full transition-all ${
                    day.isToday
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/40 ring-2 ring-rose-300'
                      : 'text-slate-400'
                  }`}
                >
                  {day.dayName}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Insight Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>
            {peakDay && peakDay.minutes > 0
              ? `이번 주 최강 몰입은 ${peakDay.dayName}요일 (${peakDay.minutes}분) 🔥`
              : '오늘의 몰입 기록을 차트에 쌓아보세요! 💖'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-bold">
          <span>월~일 열정 가득</span>
        </div>
      </div>
    </div>
  );
}
