import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddPropertyForm } from './AddPropertyForm';
import '@testing-library/jest-dom';

// Mock fetch
global.fetch = jest.fn();

describe('AddPropertyForm', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders the form fields', () => {
    render(<AddPropertyForm />);
    expect(screen.getByLabelText(/Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tenant Status/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Property/i)).toBeInTheDocument();
  });

  it('submits the form with valid data', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ insertedId: 'mock-id' }),
    });

    render(<AddPropertyForm />);

    fireEvent.change(screen.getByLabelText(/Address/i), { target: { value: '123 Test St' } });
    fireEvent.change(screen.getByLabelText(/Tenant Status/i), { target: { value: 'Vacant' } });
    
    // Select a utility
    fireEvent.click(screen.getByLabelText(/Water/i));

    fireEvent.click(screen.getByText(/Add Property/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/properties', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('123 Test St'),
      }));
    });
  });

  it('shows error message on failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
    });

    render(<AddPropertyForm />);

    fireEvent.change(screen.getByLabelText(/Address/i), { target: { value: '123 Test St' } });
    fireEvent.click(screen.getByText(/Add Property/i));

    await waitFor(() => {
      expect(screen.getByText(/Failed to add property/i)).toBeInTheDocument();
    });
  });
});
