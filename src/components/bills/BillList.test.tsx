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

const mockProperties = [
  { _id: 'prop1', address: '123 Main St' },
  { _id: 'prop2', address: '456 Oak Ave' },
];

describe('BillList', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/bills') {
        return Promise.resolve({
          ok: true,
          json: async () => mockBills,
        });
      }
      if (url === '/api/properties') {
        return Promise.resolve({
          ok: true,
          json: async () => mockProperties,
        });
      }
      return Promise.resolve({ ok: false });
    });
  });

  it('renders all bills by default', async () => {
    // Mock implementation is already set in beforeEach

    render(<BillList />);
    await waitFor(() => {
      expect(screen.getByText('Water')).toBeInTheDocument();
      expect(screen.getByText('Electric')).toBeInTheDocument();
      expect(screen.getByText('123 Main St')).toBeInTheDocument(); // Verify property address too
    });
  });

  it('toggles charged status for paid bills', async () => {
    // The initial load mocks are handled by beforeEach.
    // We need to override or append the mock for the PATCH request.
    // Since fetch is called internally, we can spy or ensure the next call returns what we want if we were using sequential mocks.
    // With mockImplementation, we can add a condition for the specific PATCH url.
    
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
       if (url === '/api/bills') {
        return Promise.resolve({
          ok: true,
          json: async () => mockBills,
        });
      }
      if (url === '/api/properties') {
        return Promise.resolve({
          ok: true,
          json: async () => mockProperties,
        });
      }
      if (url === '/api/bills/2' && options?.method === 'PATCH') {
         return Promise.resolve({
          ok: true,
          json: async () => ({ modifiedCount: 1 }),
        });
      }
      return Promise.resolve({ ok: false });
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
