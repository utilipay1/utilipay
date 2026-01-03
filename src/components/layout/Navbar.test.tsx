import { render, screen, waitFor } from '@testing-library/react';
import Navbar from './Navbar';

// Mock fetch
global.fetch = jest.fn();

const mockBills = [
  {
    _id: '1',
    status: 'Unpaid',
    due_date: new Date().toISOString(), // Critical
  }
];

describe('Navbar', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockBills,
    });
  });

  it('should render navigation links', () => {
    render(<Navbar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByText('Bills')).toBeInTheDocument();
  });

  it('should render notification center', () => {
    render(<Navbar />);
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
  });

  it('should display the count of urgent bills', async () => {
    render(<Navbar />);
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });
});

