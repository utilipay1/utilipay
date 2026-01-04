import { render, screen, waitFor } from '@testing-library/react';
import { PortfolioTable } from './PortfolioTable';

// Mock fetch
global.fetch = jest.fn();

const mockProperties = [
  {
    _id: 'prop1',
    address: '123 Main St',
    utilities_managed: ['Water', 'Electric'],
    is_archived: false,
  },
  {
    _id: 'prop2',
    address: '456 Elm St',
    utilities_managed: ['Water', 'Gas'],
    is_archived: false,
  },
];

const mockBills = [
  {
    property_id: 'prop1',
    utility_type: 'Water',
    status: 'Unpaid',
    amount: 100, // Real unpaid bill
    due_date: new Date().toISOString(),
    bill_date: new Date().toISOString(),
  },
  {
    property_id: 'prop1',
    utility_type: 'Electric',
    status: 'Paid-Charged',
    amount: 50,
    due_date: new Date().toISOString(),
    bill_date: new Date().toISOString(),
  },
  // Prop 2 Water: Paid bill exists + Future Placeholder (should be ignored)
  {
    property_id: 'prop2',
    utility_type: 'Water',
    status: 'Paid-Charged',
    amount: 80,
    due_date: '2026-01-01',
    bill_date: '2025-12-01',
  },
  {
    property_id: 'prop2',
    utility_type: 'Water',
    status: 'Unpaid',
    amount: 0, // Future Placeholder
    due_date: '2099-02-01',
    bill_date: '2099-01-01', // Future bill date
  },
  // Prop 2 Gas: Paid bill exists + Actionable Placeholder (bill date passed)
  {
    property_id: 'prop2',
    utility_type: 'Gas',
    status: 'Paid-Charged',
    amount: 40,
    due_date: '2025-12-01',
    bill_date: '2025-11-01',
  },
  {
    property_id: 'prop2',
    utility_type: 'Gas',
    status: 'Unpaid',
    amount: 0, // Actionable Placeholder
    due_date: '2026-02-01',
    bill_date: '2020-01-01', // Past bill date (definitely passed)
  },
];

describe('PortfolioTable', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/properties')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockProperties,
        });
      }
      if (url.includes('/api/bills')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockBills,
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  it('renders property addresses', async () => {
    render(<PortfolioTable />);
    await waitFor(() => {
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('456 Elm St')).toBeInTheDocument();
    });
  });

  it('shows utility status for each property', async () => {
    render(<PortfolioTable />);
    await waitFor(() => {
      // Prop 1 Water should be Unpaid (amount > 0)
      const prop1Row = screen.getByText('123 Main St').closest('tr');
      expect(prop1Row).toHaveTextContent('Water: Unpaid');
      expect(prop1Row).toHaveTextContent('Electric: Paid');
      
      // Prop 2 Water should be Paid (ignoring the future placeholder)
      const prop2Row = screen.getByText('456 Elm St').closest('tr');
      expect(prop2Row).toHaveTextContent('Water: Paid');
      
      // Prop 2 Gas should be Unpaid (placeholder bill date passed)
      expect(prop2Row).toHaveTextContent('Gas: Unpaid');
    });
  });
});
