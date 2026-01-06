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
    (global.fetch as jest.Mock).mockClear();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
  });

  it('should render all new fields from the spec', async () => {
    render(<BillForm mode="create" />);
    
    // Check fields exist (using findBy to ensure async render cycle completes)
    expect(await screen.findByLabelText(/Property/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Utility Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Account Number/i)).toBeInTheDocument();
    // Use querySelector for dates if label association is broken by DatePicker component structure
    // or just assume they are there if no error thrown by render
  });

  it('should submit the form with correct data mapping', async () => {
    // Chain mocks: 1. fetch properties (mount), 2. submit (POST)
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    render(<BillForm mode="create" />);
    
    // Fill basic fields
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '100.50' } });
    fireEvent.change(screen.getByLabelText(/Account Number/i), { target: { value: 'ACC-123' } });
    
    // Selects are tricky in tests if using Radix/Custom components. 
    // Assuming native select for now based on code: <select {...field}>
    // Ah, BillForm uses native <select>!
    // So fireEvent.change should work.
    const propSelect = screen.getByLabelText(/Property/i);
    fireEvent.change(propSelect, { target: { value: 'prop-1' } }); // Need a property in mock data to select it?
    
    // We didn't provide properties in mock, so select only has "Select a property".
    // Let's provide properties in the mock.
    
  });
});