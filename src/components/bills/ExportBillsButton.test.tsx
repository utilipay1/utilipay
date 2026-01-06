import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportBillsButton } from './ExportBillsButton';
import * as xlsx from 'xlsx';

// Mock fetch
global.fetch = jest.fn();

// Mock xlsx
jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: jest.fn(),
    book_new: jest.fn(),
    book_append_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
}));

const mockBills = [
  { _id: '1', utility_type: 'Water', amount: 50, status: 'Paid-Uncharged', due_date: new Date('2026-01-01').toISOString() },
];

describe('ExportBillsButton', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockBills,
    });
  });

  it('triggers excel export when clicked', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<ExportBillsButton bills={mockBills as any} properties={{}} />);
    
    fireEvent.click(screen.getByText(/Export to Excel/i));

    await waitFor(() => {
      expect(xlsx.writeFile).toHaveBeenCalled();
    });
  });
});
