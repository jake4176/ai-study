import React from 'react';
import { X, Sliders, Volume2, VolumeX, Palette, Heart } from 'lucide-react';

export function SettingsModal({ isOpen, onClose, settings, setSettings }) {
  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const themes = [
    { id: 'default', name: 'Deep Charcoal 💖 (기본 로즈 다크)', color: '#f43f5e' },
    { id: 'hotpink', name: 'Cute Hot Pink 🎀 (핫핑크)', color: '#ff2a85' },
    { id: 'forest', name: 'Forest Calm 🌲 (포레스트 힐링)', color: '#10b981' },
    { id: 'cyber', name: 'Cyber Neon 🔮 (사이버 네온)', color: '#8b5cf6' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-extrabold text-white">타이머 설정 💖</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duration Settings */}
        <div className="space-y-4 mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">세션 시간 (분 단위)</h3>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">집중 (Focus)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={settings.focusTime}
                onChange={(e) => handleChange('focusTime', Number(e.target.value))}
                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-bold text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">짧은 휴식</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.shortBreakTime}
                onChange={(e) => handleChange('shortBreakTime', Number(e.target.value))}
                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">긴 휴식</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.longBreakTime}
                onChange={(e) => handleChange('longBreakTime', Number(e.target.value))}
                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-bold text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Auto Start & Sound Toggles */}
        <div className="space-y-3 mb-6 pt-4 border-t border-slate-800/80">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">자동화 및 알림</h3>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <span className="text-xs text-slate-200 font-semibold">휴식 세션 자동 시작</span>
            <input
              type="checkbox"
              checked={settings.autoStartBreaks}
              onChange={(e) => handleChange('autoStartBreaks', e.target.checked)}
              className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <span className="text-xs text-slate-200 font-semibold">집중 세션 자동 시작</span>
            <input
              type="checkbox"
              checked={settings.autoStartFocus}
              onChange={(e) => handleChange('autoStartFocus', e.target.checked)}
              className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold">
              {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
              <span>알림 사운드 효과 🎵</span>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => handleChange('soundEnabled', e.target.checked)}
              className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Theme Picker */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-purple-400" />
            <span>테마 선택 (Color Themes) 🎀</span>
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => handleChange('theme', t.id)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  settings.theme === t.id
                    ? 'border-white bg-slate-800 text-white shadow-md'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: t.color }}></span>
                <span className="truncate">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-500/20"
          >
            저장 및 닫기 💖
          </button>
        </div>
      </div>
    </div>
  );
}
