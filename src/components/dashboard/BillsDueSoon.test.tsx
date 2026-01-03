import { render, screen, waitFor } from '@testing-library/react';
import { BillsDueSoon } from './BillsDueSoon';
import { addDays, startOfDay } from 'date-fns';

// Mock fetch
global.fetch = jest.fn();

const today = startOfDay(new Date());

const mockBills = [
  {
    _id: '1',
    property_id: 'prop1',
    utility_type: 'Water',
    amount: 50,
    due_date: addDays(today, 1).toISOString(),
    status: 'Unpaid',
    billing_period_start: new Date().toISOString(),
    billing_period_end: new Date().toISOString(),
    bill_date: new Date().toISOString()
  },
  {
    _id: '2',
    property_id: 'prop2',
    utility_type: 'Electric',
    amount: 100,
    due_date: addDays(today, 3).toISOString(),
    status: 'Unpaid',
    billing_period_start: new Date().toISOString(),
    billing_period_end: new Date().toISOString(),
    bill_date: new Date().toISOString()
  },
  {
    _id: '3',
    property_id: 'prop3',
    utility_type: 'Gas',
    amount: 75,
    due_date: addDays(today, 5).toISOString(),
    status: 'Unpaid',
    billing_period_start: new Date().toISOString(),
    billing_period_end: new Date().toISOString(),
    bill_date: new Date().toISOString()
  },
];

describe('BillsDueSoon', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockBills,
    });
  });

  it('renders alerts with currency symbol and days remaining', async () => {
    render(<BillsDueSoon />);
    await waitFor(() => {
      expect(screen.getByText('Water')).toBeInTheDocument();
      expect(screen.getByText(/₹50/)).toBeInTheDocument();
      expect(screen.getByText(/Due Tomorrow/i)).toBeInTheDocument();
      
      expect(screen.getByText('Electric')).toBeInTheDocument();
      expect(screen.getByText(/₹100/)).toBeInTheDocument();
      expect(screen.getByText(/Due in 3 days/i)).toBeInTheDocument();
    });
  });
});
