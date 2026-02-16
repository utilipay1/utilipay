import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PropertyList } from './PropertyList';
import '@testing-library/jest-dom';
import { SWRConfig } from 'swr';
import { PropertySchema } from '@/lib/schemas';
import { z } from 'zod';

type Property = z.infer<typeof PropertySchema>;

// Mock fetch
global.fetch = jest.fn();

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
);

const mockProperties = [
  { _id: '1', address: '123 Main St', tenant_status: 'Occupied', utilities_managed: ['Water'], is_archived: false, is_managed: true },
  { _id: '2', address: '456 Oak Ave', tenant_status: 'Vacant', utilities_managed: ['Electric'], is_archived: false, is_managed: true },
];

describe('PropertyList', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    global.confirm = jest.fn(() => true); // Mock confirm to always return true
  });

  it('renders a list of properties', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/companies')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: [] }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(
      <PropertyList 
        properties={mockProperties as Property[]} 
        isLoading={false} 
        page={1} 
        setPage={jest.fn()} 
        pagination={{ total: 2, page: 1, limit: 20, totalPages: 1 }}
      />, 
      { wrapper: Wrapper }
    );

    // Wait for the data to be loaded and rendered
    await waitFor(() => {
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('456 Oak Ave')).toBeInTheDocument();
    });
  });

  it('calls archive API when archive button is clicked', async () => {
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
        if (url.includes('/api/properties') && options?.method === 'PATCH') {
             return Promise.resolve({
                ok: true,
                json: async () => ({ modifiedCount: 1 }),
              });
        }
        if (url.includes('/api/companies')) {
            return Promise.resolve({
              ok: true,
              json: async () => ({ data: [] }),
            });
          }
        return Promise.reject(new Error('Unknown URL'));
    });

    render(
      <PropertyList 
        properties={mockProperties as Property[]} 
        isLoading={false} 
        page={1} 
        setPage={jest.fn()} 
        pagination={{ total: 2, page: 1, limit: 20, totalPages: 1 }}
      />, 
      { wrapper: Wrapper }
    );

    await waitFor(() => screen.getByText('123 Main St'));

    // The component might be using lucide-react icons which might not have "title" attribute by default unless I added it or the test setup does.
    // However, the original test used getAllByTitle.
    // In my refactor, I used DropdownMenu for actions.
    // The "Archive" button is inside the DropdownMenu.
    // So I need to open the dropdown first.
    
    // Find the trigger (MoreHorizontal icon button)
    const row = screen.getByText('123 Main St').closest('tr');
    const menuTrigger = row?.querySelector('button'); // First button in row is likely the trigger
    if (menuTrigger) {
        fireEvent.click(menuTrigger);
    }

    // Now look for "Archive" text
    const archiveButton = await screen.findByText('Archive');
    fireEvent.click(archiveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/properties/1'), expect.objectContaining({
        method: 'PATCH',
        body: expect.stringContaining('"is_archived":true'),
      }));
    });
  });
});