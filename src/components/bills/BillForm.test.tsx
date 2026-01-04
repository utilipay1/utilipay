import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BillForm } from './BillForm';

// Mock fetch
global.fetch = jest.fn();

const mockProperties = [
  { _id: 'prop1', address: '123 Main St', utilities_managed: ['Water', 'Electric'] },
  { _id: 'prop2', address: '456 Oak Ave', utilities_managed: ['Gas'] },
];

describe('BillForm', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/properties') {
        return Promise.resolve({
          ok: true,
          json: async () => mockProperties,
        });
      }
      return Promise.resolve({ ok: true });
    });
  });

  it('should render all new fields from the spec', async () => {
    render(<BillForm mode="create" />);
    
    await waitFor(() => expect(screen.getByLabelText(/Property/i)).toBeInTheDocument());
    
    expect(screen.getByLabelText(/Utility Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Account Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Billing Period Start/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Billing Period End/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bill Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Due Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
  });

  it('should submit the form with correct data mapping', async () => {
    render(<BillForm mode="create" />);
    
    await waitFor(() => expect(screen.getByLabelText(/Property/i)).toBeInTheDocument());
    
    fireEvent.change(screen.getByLabelText(/Property/i), { target: { value: 'prop1' } });
    fireEvent.change(screen.getByLabelText(/Utility Type/i), { target: { value: 'Water' } });
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/Account Number/i), { target: { value: 'ACC123' } });
    
    // Simplistic date entry for testing purposes
    fireEvent.change(screen.getByLabelText(/Billing Period Start/i), { target: { value: '2026-01-01' } });
    fireEvent.change(screen.getByLabelText(/Billing Period End/i), { target: { value: '2026-01-31' } });
    fireEvent.change(screen.getByLabelText(/Bill Date/i), { target: { value: '2026-02-01' } });
    fireEvent.change(screen.getByLabelText(/Due Date/i), { target: { value: '2026-02-15' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Add Bill/i }));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/bills', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"property_id":"prop1"'),
      }));
      
      const body = JSON.parse((global.fetch as jest.Mock).mock.calls.find(c => c[0] === '/api/bills')[1].body);
      expect(body.utility_type).toBe('Water');
      expect(body.amount).toBe(50);
      expect(body.account_number).toBe('ACC123');
      expect(body.status).toBe('Unpaid');
    });
  });
});