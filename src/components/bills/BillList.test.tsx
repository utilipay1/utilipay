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
    // Pass props directly since BillList is a presentational component
    const propsMap = { prop1: '123 Main St', prop2: '456 Oak Ave' };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<BillList 
      bills={mockBills as any} 
      properties={propsMap} 
      fullProperties={{}} 
      companies={{}} 
      onRefresh={jest.fn()} 
    />);
    
    expect(screen.getByText('Water')).toBeInTheDocument();
    expect(screen.getByText('Electric')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
  });

  it('toggles charged status for paid bills', async () => {
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (url === '/api/bills/2' && options?.method === 'PATCH') {
         return Promise.resolve({
          ok: true,
          json: async () => ({ modifiedCount: 1 }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    const propsMap = { prop1: '123 Main St', prop2: '456 Oak Ave' };
    const refreshMock = jest.fn();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<BillList 
      bills={mockBills as any} 
      properties={propsMap} 
      fullProperties={{}} 
      companies={{}} 
      onRefresh={refreshMock} 
    />);

    const switches = screen.getAllByRole('switch');
    // Water is Unpaid (index 0), switch should be disabled
    expect(switches[0]).toBeDisabled();
    // Electric is Paid (index 1), switch should be enabled
    expect(switches[1]).not.toBeDisabled();

    fireEvent.click(switches[1]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/bills/2', expect.objectContaining({
        method: 'PATCH',
        body: expect.stringContaining('"status":"Paid-Charged"'),
      }));
      expect(refreshMock).toHaveBeenCalled();
    });
  });
});
