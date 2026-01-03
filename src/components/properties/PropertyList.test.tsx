import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PropertyList } from './PropertyList';
import '@testing-library/jest-dom';

// Mock fetch
global.fetch = jest.fn();

const mockProperties = [
  { _id: '1', address: '123 Main St', tenant_status: 'Occupied', utilities_managed: ['Water'], is_archived: false },
  { _id: '2', address: '456 Oak Ave', tenant_status: 'Vacant', utilities_managed: ['Electric'], is_archived: false },
];

describe('PropertyList', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders a list of properties', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProperties,
    });

    render(<PropertyList />);

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('456 Oak Ave')).toBeInTheDocument();
    });
  });

  it('filters properties based on search input', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProperties,
    });

    render(<PropertyList />);

    await waitFor(() => screen.getByText('123 Main St'));

    const searchInput = screen.getByPlaceholderText(/Search by address/i);
    fireEvent.change(searchInput, { target: { value: 'Main' } });

    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.queryByText('456 Oak Ave')).not.toBeInTheDocument();
  });

  it('calls archive API when archive button is clicked', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProperties,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ modifiedCount: 1 }),
      });

    render(<PropertyList />);

    await waitFor(() => screen.getByText('123 Main St'));

    const archiveButtons = screen.getAllByText(/Archive/i);
    fireEvent.click(archiveButtons[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/properties/1', expect.objectContaining({
        method: 'PATCH',
        body: expect.stringContaining('"is_archived":true'),
      }));
    });
  });
});
