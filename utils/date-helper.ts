/**
 * Year ranges used by dashboard copy (LEAVE SUMMARY / headings).
 */
export function leaveSummaryHeadingYears(selectedYear: number): { current: number; previous: number } {
  return { current: selectedYear, previous: selectedYear - 1 };
}

export function culturalActivitiesHeadingYears(selectedYear: number): { y1: number; y2: number } {
  return { y1: selectedYear, y2: selectedYear - 1 };
}

export function procedureMissesRangeLabel(selectedYear: number): string {
  // Fiscal year runs JUN → MAY (e.g. year 2026 → "2025 JUN - 2026 MAY")
  return `${selectedYear - 1} JUN - ${selectedYear} MAY`;
}
