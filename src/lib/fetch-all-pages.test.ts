import { fetchAllPages } from './fetch-all-pages';

describe('fetchAllPages', () => {
  const fetchMock = global.fetch as jest.Mock;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
    global.fetch = fetchMock;
  });

  it('requests every page and concatenates the matching rows', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ _id: '1' }, { _id: '2' }],
          pagination: { totalPages: 2, page: 1, limit: 2, total: 3 },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ _id: '3' }],
          pagination: { totalPages: 2, page: 2, limit: 2, total: 3 },
        }),
      });

    const rows = await fetchAllPages<{ _id: string }>(
      '/api/bills?status=Paid&propertyId=abc,def',
      2
    );

    expect(rows.map((row) => row._id)).toEqual(['1', '2', '3']);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      '/api/bills?status=Paid&propertyId=abc%2Cdef&page=1&limit=2'
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      '/api/bills?status=Paid&propertyId=abc%2Cdef&page=2&limit=2'
    );
  });

  it('throws when a page request fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(fetchAllPages('/api/properties?archived=false')).rejects.toThrow(
      'Failed to fetch page 1: 500'
    );
  });
});
