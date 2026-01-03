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

  it('renders the form fields', () => {
    render(<AddBillForm />);
    expect(screen.getByLabelText(/Select Property/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Utility Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByText(/Submit New Bill Entry/i)).toBeInTheDocument();
  });

  it('submits the form with valid data', async () => {
    render(<AddBillForm />);

    // Wait for properties to load
    await waitFor(() => {
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Select Property/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Utility Type/i), { target: { value: 'Water' } });
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '50' } });
    
    // Period and Due Date fields
    // For now we'll assume they have defaults or we can set them
    
    fireEvent.click(screen.getByText(/Submit New Bill Entry/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/bills', expect.objectContaining({
        method: 'POST',
      }));
    });
  });
});
