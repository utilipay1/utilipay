type PaginatedResponse<T> = {
  data?: T[];
  pagination?: {
    totalPages?: number;
  };
};

const DEFAULT_PAGE_SIZE = 500;

export async function fetchAllPages<T>(
  baseUrl: string,
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = new URL(baseUrl, 'http://localhost');
    url.searchParams.set('page', String(page));
    url.searchParams.set('limit', String(pageSize));

    const response = await fetch(`${url.pathname}${url.search}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch page ${page}: ${response.status}`);
    }

    const json = (await response.json()) as PaginatedResponse<T>;
    const rows = json.data ?? [];
    all.push(...rows);

    totalPages = json.pagination?.totalPages ?? 1;
    if (rows.length === 0) break;
    page += 1;
  }

  return all;
}
