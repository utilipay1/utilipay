import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportPropertiesButton } from './ExportPropertiesButton';
import * as xlsx from 'xlsx';

jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: jest.fn(),
    book_new: jest.fn(),
    book_append_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
}));

const pageOneProperty = {
  _id: '1',
  address: '123 Main',
  tenant_status: 'Occupied',
  utilities_managed: ['Water'],
  is_managed: true,
  is_archived: false,
};

const pageTwoProperty = {
  ...pageOneProperty,
  _id: '2',
  address: '456 Oak',
};

describe('ExportPropertiesButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [pageOneProperty],
          pagination: { totalPages: 2, page: 1, limit: 500, total: 2 },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [pageTwoProperty],
          pagination: { totalPages: 2, page: 2, limit: 500, total: 2 },
        }),
      });
  });

  it('exports every matching property, not just the current page', async () => {
    render(
      <ExportPropertiesButton
        queryString="search=Main&archived=false"
        total={2}
        companies={{}}
      />
    );

    fireEvent.click(screen.getByText(/Export to Excel/i));

    await waitFor(() => {
      expect(xlsx.writeFile).toHaveBeenCalled();
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(xlsx.utils.json_to_sheet).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ Address: '123 Main' }),
        expect.objectContaining({ Address: '456 Oak' }),
      ])
    );
  });

  it('is disabled when there are no matching properties', () => {
    render(
      <ExportPropertiesButton
        queryString="archived=false"
        total={0}
        companies={{}}
      />
    );

    expect(screen.getByRole('button', { name: /Export to Excel/i })).toBeDisabled();
  });
});
