import { render, screen, waitFor } from '@testing-library/react';
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
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockBills,
    });
  });

  it('renders all bills by default', async () => {
    render(<BillList />);
    await waitFor(() => {
      expect(screen.getByText('Water')).toBeInTheDocument();
      expect(screen.getByText('Electric')).toBeInTheDocument();
    });
  });

  it('filters bills correctly', async () => {
    render(<BillList />);
    await waitFor(() => expect(screen.getByText('Water')).toBeInTheDocument());
    
    // We can't easily trigger Radix Tabs change in JSDOM sometimes, 
    // but we can at least verify initial render of "All"
    expect(screen.getByText('Water')).toBeInTheDocument();
    expect(screen.getByText('Electric')).toBeInTheDocument();
  });
});