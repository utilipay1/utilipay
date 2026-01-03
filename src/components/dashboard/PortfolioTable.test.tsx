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
    due_date: new Date().toISOString(),
  },
  {
    property_id: 'prop1',
    utility_type: 'Electric',
    status: 'Paid',
    due_date: new Date().toISOString(),
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
      // Prop 1 Water should be Unpaid
      const prop1Row = screen.getByText('123 Main St').closest('tr');
      expect(prop1Row).toHaveTextContent('Water: Unpaid');
      expect(prop1Row).toHaveTextContent('Electric: Paid');
      
      // Prop 2 should have utilities but no bill data yet
      const prop2Row = screen.getByText('456 Elm St').closest('tr');
      expect(prop2Row).toHaveTextContent('Water: No Bill');
    });
  });
});
