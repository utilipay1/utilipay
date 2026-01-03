import { render, screen, waitFor } from '@testing-library/react';
import { BillsDueSoon } from './BillsDueSoon';
import { addDays } from 'date-fns';

// Mock fetch
global.fetch = jest.fn();

const mockBills = [
  {
    _id: '1',
    property_id: 'prop1',
    utility_type: 'Water',
    amount: 50,
    due_date: addDays(new Date(), 1).toISOString(),
    status: 'Unpaid',
  },
  {
    _id: '2',
    property_id: 'prop2',
    utility_type: 'Electric',
    amount: 100,
    due_date: addDays(new Date(), 3).toISOString(),
    status: 'Unpaid',
  },
  {
    _id: '3',
    property_id: 'prop3',
    utility_type: 'Gas',
    amount: 75,
    due_date: addDays(new Date(), 5).toISOString(),
    status: 'Unpaid',
  },
  {
    _id: '4',
    property_id: 'prop4',
    utility_type: 'Sewer',
    amount: 30,
    due_date: addDays(new Date(), 10).toISOString(),
    status: 'Unpaid',
  }
];

describe('BillsDueSoon', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockBills,
    });
  });

  it('renders critical alerts for bills due in 1 day', async () => {
    render(<BillsDueSoon />);
    await waitFor(() => {
      expect(screen.getByText(/Critical/)).toBeInTheDocument();
      expect(screen.getByText(/Water/)).toBeInTheDocument();
    });
  });

  it('renders warning alerts for bills due in 3 days', async () => {
    render(<BillsDueSoon />);
    await waitFor(() => {
      expect(screen.getByText(/Warning/)).toBeInTheDocument();
      expect(screen.getByText(/Electric/)).toBeInTheDocument();
    });
  });

  it('renders info alerts for bills due in 5 days', async () => {
    render(<BillsDueSoon />);
    await waitFor(() => {
      expect(screen.getByText(/Info/)).toBeInTheDocument();
      expect(screen.getByText(/Gas/)).toBeInTheDocument();
    });
  });

  it('does not render alerts for bills due in more than 5 days', async () => {
    render(<BillsDueSoon />);
    await waitFor(() => {
      expect(screen.queryByText(/Sewer/)).not.toBeInTheDocument();
    });
  });
});
