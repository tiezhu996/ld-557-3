export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function paginate<T>(items: T[], page = 1, pageSize = 20): PageResult<T> {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 20));
  const start = (safePage - 1) * safePageSize;

  return {
    list: items.slice(start, start + safePageSize),
    total: items.length,
    page: safePage,
    pageSize: safePageSize,
  };
}

