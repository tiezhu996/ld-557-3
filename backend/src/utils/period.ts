export interface PeriodRange {
  start: Date;
  end: Date;
  label: string;
}

export function parsePeriod(period: string): PeriodRange {
  const trimmed = period.trim();

  const quarterMatch = trimmed.match(/^(\d{4})-Q([1-4])$/i);
  if (quarterMatch) {
    const year = parseInt(quarterMatch[1], 10);
    const quarter = parseInt(quarterMatch[2], 10);
    const startMonth = (quarter - 1) * 3;
    const start = new Date(year, startMonth, 1);
    const end = new Date(year, startMonth + 3, 0, 23, 59, 59, 999);
    return { start, end, label: `${year}年第${quarter}季度` };
  }

  const monthMatch = trimmed.match(/^(\d{4})-(\d{1,2})$/);
  if (monthMatch) {
    const year = parseInt(monthMatch[1], 10);
    const month = parseInt(monthMatch[2], 10) - 1;
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return { start, end, label: `${year}年${month + 1}月` };
  }

  const yearMatch = trimmed.match(/^(\d{4})$/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);
    return { start, end, label: `${year}年度` };
  }

  const rangeMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})[~至](\d{4}-\d{2}-\d{2})$/);
  if (rangeMatch) {
    const start = new Date(rangeMatch[1]);
    const end = new Date(rangeMatch[2] + 'T23:59:59.999');
    return { start, end, label: `${rangeMatch[1]} 至 ${rangeMatch[2]}` };
  }

  throw new Error('无法解析周期格式，支持：2026-Q1、2026-01、2026、2026-01-01~2026-03-31');
}

export function isInPeriod(dateStr: string, period: PeriodRange): boolean {
  const date = new Date(dateStr);
  return date >= period.start && date <= period.end;
}
