import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BillList } from './BillList';

// Mock fetch
global.fetch = jest.fn();

const mockBills = [
  { 
    _id: '1', 
    property_id: 'prop1',
    utility_type: 'Water', 
    amount: 50, 
    status: 'Unpaid', 
    due_date: new Date().toISOString(),
    billing_period_start: new Date().toISOString(),
    billing_period_end: new Date().toISOString(),
    bill_date: new Date().toISOString()
  },
  { 
    _id: '2', 
    property_id: 'prop2',
    utility_type: 'Electric', 
    amount: 100, 
    status: 'Paid-Uncharged', 
    due_date: new Date().toISOString(),
    billing_period_start: new Date().toISOString(),
    billing_period_end: new Date().toISOString(),
    bill_date: new Date().toISOString()
  },
];

describe('BillList', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it('renders all bills by default', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockBills,
    });

    render(<BillList />);
    await waitFor(() => {
      expect(screen.getByText('Water')).toBeInTheDocument();
      expect(screen.getByText('Electric')).toBeInTheDocument();
    });
  });

  it('toggles charged status for paid bills', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBills,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ modifiedCount: 1 }),
      });

    render(<BillList />);

    await waitFor(() => screen.getByText('Electric'));

    const switches = screen.getAllByRole('switch');
    // Water is Unpaid, switch should be disabled
    expect(switches[0]).toBeDisabled();
    // Electric is Paid, switch should be enabled
    expect(switches[1]).not.toBeDisabled();

    fireEvent.click(switches[1]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/bills/2', expect.objectContaining({
        method: 'PATCH',
        body: expect.stringContaining('"status":"Paid-Charged"'),
      }));
    });
  });
});
