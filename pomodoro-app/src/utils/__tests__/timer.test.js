import { describe, it, expect } from 'vitest';
import { formatTime, calculateProgress, getNextSessionMode, getCurrentWeekDays } from '../timerUtils.js';

describe('Pomodoro Timer Utilities', () => {
  describe('formatTime', () => {
    it('formats 1500 seconds as 25:00', () => {
      expect(formatTime(1500)).toBe('25:00');
    });

    it('formats 300 seconds as 05:00', () => {
      expect(formatTime(300)).toBe('05:00');
    });

    it('formats 9 seconds as 00:09', () => {
      expect(formatTime(9)).toBe('00:09');
    });

    it('handles 0 seconds gracefully', () => {
      expect(formatTime(0)).toBe('00:00');
    });

    it('handles invalid inputs gracefully', () => {
      expect(formatTime(-10)).toBe('00:00');
      expect(formatTime(null)).toBe('00:00');
      expect(formatTime(undefined)).toBe('00:00');
    });
  });

  describe('calculateProgress', () => {
    it('returns 0 when timer starts', () => {
      expect(calculateProgress(1500, 1500)).toBe(0);
    });

    it('returns 50 when half time elapsed', () => {
      expect(calculateProgress(750, 1500)).toBe(50);
    });

    it('returns 100 when finished', () => {
      expect(calculateProgress(0, 1500)).toBe(100);
    });
  });

  describe('getNextSessionMode', () => {
    it('switches from focus to shortBreak after 1st focus session', () => {
      expect(getNextSessionMode('focus', 0, 4)).toBe('shortBreak');
    });

    it('switches to longBreak after 4th focus session', () => {
      expect(getNextSessionMode('focus', 3, 4)).toBe('longBreak');
    });

    it('switches back to focus after shortBreak', () => {
      expect(getNextSessionMode('shortBreak', 1, 4)).toBe('focus');
    });

    it('switches back to focus after longBreak', () => {
      expect(getNextSessionMode('longBreak', 4, 4)).toBe('focus');
    });
  });

  describe('getCurrentWeekDays', () => {
    it('returns 7 days starting from Monday to Sunday', () => {
      const mockDate = new Date('2026-08-03T12:00:00Z'); // Monday
      const history = {
        '2026-08-03': { focusCount: 4, focusMinutes: 100 }
      };

      const days = getCurrentWeekDays(history, mockDate);
      expect(days).toHaveLength(7);
      expect(days[0].dayName).toBe('월');
      expect(days[0].dateStr).toBe('2026-08-03');
      expect(days[0].minutes).toBe(100);
      expect(days[0].isToday).toBe(true);

      expect(days[6].dayName).toBe('일');
      expect(days[6].dateStr).toBe('2026-08-09');
    });
  });
});
