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
    expect(screen.getByLabelText(/Property Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Occupancy Status/i)).toBeInTheDocument();
    expect(screen.getByText(/Register New Property/i)).toBeInTheDocument();
  });

  it('submits the form with valid data', async () => {
    render(<AddPropertyForm />);

    fireEvent.change(screen.getByLabelText(/Property Address/i), { target: { value: '123 Test St' } });
    fireEvent.change(screen.getByLabelText(/Occupancy Status/i), { target: { value: 'Vacant' } });
    
    // Select a utility
    fireEvent.click(screen.getByText(/Water/i));

    fireEvent.click(screen.getByText(/Register New Property/i));

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

    fireEvent.change(screen.getByLabelText(/Property Address/i), { target: { value: '123 Test St' } });
    fireEvent.click(screen.getByText(/Register New Property/i));

    await waitFor(() => {
      expect(screen.getByText(/Failed to add property/i)).toBeInTheDocument();
    });
  });
});
