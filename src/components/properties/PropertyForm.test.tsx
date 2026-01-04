import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PropertyForm } from './PropertyForm';

// Mock fetch
global.fetch = jest.fn();

describe('PropertyForm', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('should render all new fields from the spec', () => {
    render(<PropertyForm mode="create" />);
    
    expect(screen.getByLabelText(/Property Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Owner Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Owner Contact/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tenant Status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
    
    // Utilities checkboxes
    expect(screen.getByLabelText(/Water/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sewer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Gas/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Electric/i)).toBeInTheDocument();
  });

  it('should show tenant fields only when status is Occupied', () => {
    render(<PropertyForm mode="create" />);
    
    // Initially Vacant, no tenant fields should be visible (or at least Name shouldn't be)
    // The spec says "Tenant Name (Dynamic: Appears only if 'Occupied' is selected)"
    expect(screen.queryByLabelText(/Tenant Name/i)).not.toBeInTheDocument();
    
    // Change to Occupied
    fireEvent.change(screen.getByLabelText(/Tenant Status/i), { target: { value: 'Occupied' } });
    
    expect(screen.getByLabelText(/Tenant Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tenant Contact/i)).toBeInTheDocument();
  });

  it('should submit the form with correct data mapping', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    render(<PropertyForm mode="create" />);
    
    fireEvent.change(screen.getByLabelText(/Property Address/i), { target: { value: '789 Pine St' } });
    fireEvent.change(screen.getByLabelText(/Owner Name/i), { target: { value: 'John Owner' } });
    fireEvent.change(screen.getByLabelText(/Tenant Status/i), { target: { value: 'Occupied' } });
    
    // Wait for dynamic field
    await waitFor(() => expect(screen.getByLabelText(/Tenant Name/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Tenant Name/i), { target: { value: 'Jane Tenant' } });
    
    fireEvent.click(screen.getByLabelText(/Water/i));
    
    fireEvent.click(screen.getByRole('button', { name: /Add Property/i }));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/properties', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"address":"789 Pine St"'),
      }));
      
      const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(body.owner_info.name).toBe('John Owner');
      expect(body.tenant_info.name).toBe('Jane Tenant');
      expect(body.utilities_managed).toContain('Water');
    });
  });
});