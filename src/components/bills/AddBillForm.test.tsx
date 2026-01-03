import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddBillForm } from './AddBillForm';
import '@testing-library/jest-dom';

// Mock fetch
global.fetch = jest.fn();

const mockProperties = [
  { _id: '1', address: '123 Main St', utilities_managed: ['Water', 'Electric'] },
];

describe('AddBillForm', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/properties') {
        return Promise.resolve({
          ok: true,
          json: async () => mockProperties,
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });
  });

  it('renders the form fields', async () => {
    render(<AddBillForm />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Property/i)).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText(/Utility Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Bill/i)).toBeInTheDocument();
  });

  it('submits the form with valid data', async () => {
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (url === '/api/properties') {
        return Promise.resolve({
          ok: true,
          json: async () => mockProperties,
        });
      }
      if (url === '/api/bills' && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ acknowledged: true, insertedId: 'mock-bill-id' }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    render(<AddBillForm />);

    await waitFor(() => screen.getByLabelText(/Property/i));

    fireEvent.change(screen.getByLabelText(/Property/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Utility Type/i), { target: { value: 'Water' } });
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '50.00' } });
    
    // Dates are harder to test with standard fireEvent if they use native date pickers or complex UI components
    // For now we'll assume they have defaults or we can set them
    
    fireEvent.click(screen.getByText(/Add Bill/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/bills', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Water'),
      }));
    });
  });
});
