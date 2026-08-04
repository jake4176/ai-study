/**
 * Formats time in seconds into MM:SS string.
 * @param {number} totalSeconds 
 * @returns {string} e.g. "25:00"
 */
export function formatTime(totalSeconds) {
  if (typeof totalSeconds !== 'number' || totalSeconds < 0 || isNaN(totalSeconds)) {
    return '00:00';
  }
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const paddedMins = String(mins).padStart(2, '0');
  const paddedSecs = String(secs).padStart(2, '0');
  return `${paddedMins}:${paddedSecs}`;
}

/**
 * Calculates progress percentage from 0 to 100.
 * @param {number} secondsLeft 
 * @param {number} totalSeconds 
 * @returns {number}
 */
export function calculateProgress(secondsLeft, totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return 0;
  const elapsed = totalSeconds - Math.max(0, secondsLeft);
  const percent = (elapsed / totalSeconds) * 100;
  return Math.min(100, Math.max(0, percent));
}

/**
 * Determines the next session mode.
 * @param {string} currentMode 'focus' | 'shortBreak' | 'longBreak'
 * @param {number} focusCount Number of completed focus sessions
 * @param {number} longBreakInterval Default: 4
 * @returns {string} Next session mode
 */
export function getNextSessionMode(currentMode, focusCount, longBreakInterval = 4) {
  if (currentMode === 'shortBreak' || currentMode === 'longBreak') {
    return 'focus';
  }
  const nextFocusCount = focusCount + 1;
  if (nextFocusCount % longBreakInterval === 0) {
    return 'longBreak';
  }
  return 'shortBreak';
}

/**
 * Generates array of 7 days (Monday to Sunday) for the current week with focus minutes.
 * @param {Object} dailyHistory e.g. { '2026-08-03': { focusCount: 4, focusMinutes: 100 } }
 * @param {Date} [nowDate]
 * @returns {Array} Array of 7 day objects
 */
export function getCurrentWeekDays(dailyHistory = {}, nowDate = new Date()) {
  const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];
  const todayStr = nowDate.toISOString().split('T')[0];

  // Get current day of week (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const currentDayOfWeek = nowDate.getDay();
  // Calculate offset to get Monday (If Sunday (0), offset is -6 days)
  const distToMon = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;

  const monday = new Date(nowDate);
  monday.setDate(nowDate.getDate() + distToMon);

  const weekDays = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const data = dailyHistory[dateStr] || { focusCount: 0, focusMinutes: 0 };

    weekDays.push({
      dayName: dayLabels[i],
      dateStr,
      minutes: data.focusMinutes || 0,
      count: data.focusCount || 0,
      isToday: dateStr === todayStr,
    });
  }

  return weekDays;
}
