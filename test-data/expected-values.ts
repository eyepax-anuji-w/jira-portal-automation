/**
 * Static copy and patterns — align with `test cases/` and locked test-user data when available.
 */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const HEADING_PATTERNS = {
  leaveSummary: (y1: number, y2: number) =>
    new RegExp(`LEAVE SUMMARY\\s*\\(${y1}\\s*&\\s*${y2}\\)`, 'i'),
  culturalActivities: (y1: number, y2: number) =>
    new RegExp(`CULTURAL ACTIVITIES\\s*\\(${y1}\\s*&\\s*${y2}\\)`, 'i'),
  procedureMisses: (range: string) =>
    new RegExp(`PROCEDURE MISSES\\s*\\(${escapeRegExp(range)}\\)`, 'i'),
} as const;

export const MOOD_POPUP_TEXT = /How Are You Feeling/i;
