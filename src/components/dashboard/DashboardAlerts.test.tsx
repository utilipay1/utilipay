import { render, screen, waitFor } from '@testing-library/react';
import { DashboardAlerts } from './DashboardAlerts';
import { addDays, subDays, startOfDay } from 'date-fns';

// Mock fetch
global.fetch = jest.fn();

const today = startOfDay(new Date());

const mockBills = [
  {
    _id: '1',
    property_id: 'prop1',
    utility_type: 'Water',
    amount: 50,
    due_date: subDays(today, 2).toISOString(), // Overdue
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
    due_date: addDays(today, 1).toISOString(), // Due Tomorrow
    status: 'Unpaid',
    billing_period_start: new Date().toISOString(),
    billing_period_end: new Date().toISOString(),
    bill_date: new Date().toISOString()
  },
];

describe('DashboardAlerts', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockBills }),
    });
  });

  it('renders overdue and upcoming alerts', async () => {
    render(<DashboardAlerts />);
    
    await waitFor(() => {
      expect(screen.getByText('Overdue')).toBeInTheDocument();
      expect(screen.getByText('Water')).toBeInTheDocument();
      
      expect(screen.getByText('Upcoming')).toBeInTheDocument();
      expect(screen.getByText('Electric')).toBeInTheDocument();
    });
  });
});
