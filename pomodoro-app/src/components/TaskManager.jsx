import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Target } from 'lucide-react';

export function TaskManager({ tasks, setTasks, activeTaskId, setActiveTaskId }) {
  const [newTitle, setNewTitle] = useState('');
  const [estPomodoros, setEstPomodoros] = useState(2);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      estPomodoros: Number(estPomodoros) || 1,
      actPomodoros: 0,
      completed: false,
    };

    const updated = [...tasks, newTask];
    setTasks(updated);
    if (!activeTaskId) {
      setActiveTaskId(newTask.id);
    }
    setNewTitle('');
  };

  const toggleTaskComplete = (id) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    if (activeTaskId === id) {
      setActiveTaskId(updated[0]?.id || null);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto glass-panel rounded-3xl p-6 mt-8 border border-white/10 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-rose-400" />
          <span>오늘의 몰입 목표 (Tasks) 💖</span>
        </h2>
        <span className="text-xs font-bold text-slate-300 bg-slate-900/60 px-2.5 py-1 rounded-full border border-slate-700">
          {tasks.filter((t) => t.completed).length} / {tasks.length} 완료 ✨
        </span>
      </div>

      {/* Task Creation Input Form */}
      <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="어떤 멋진 작업에 몰입해볼까요? ✨"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors shadow-inner"
        />
        <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-700/60 rounded-xl px-2">
          <span className="text-xs">🍅</span>
          <input
            type="number"
            min="1"
            max="10"
            value={estPomodoros}
            onChange={(e) => setEstPomodoros(e.target.value)}
            className="w-9 bg-transparent text-center text-sm font-bold text-white focus:outline-none"
            title="목표 뽀모도로 수"
          />
        </div>
        <button
          type="submit"
          className="bg-rose-500 hover:bg-rose-600 text-white p-2.5 rounded-xl transition-all shadow-md shadow-rose-500/20"
          title="작업 추가"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      {/* Task List */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <p className="text-center py-6 text-xs font-medium text-slate-500">
            등록된 작업이 없어요 🌸 대표님의 멋진 세션을 추가해 주세요!
          </p>
        ) : (
          tasks.map((task) => {
            const isActive = task.id === activeTaskId;
            return (
              <div
                key={task.id}
                onClick={() => setActiveTaskId(task.id)}
                className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all duration-200 border ${
                  isActive
                    ? 'bg-rose-500/10 border-rose-500/40 shadow-sm scale-[1.01]'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskComplete(task.id);
                    }}
                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <span
                    className={`text-sm truncate font-semibold ${
                      task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {/* Pomodoro Counter Badge */}
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                    <span>🍅</span>
                    <span>{task.actPomodoros} / {task.estPomodoros}</span>
                  </span>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
