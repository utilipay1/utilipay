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
  it('should render brand name', () => {
    render(<Navbar />);
    expect(screen.getByText('UtiliPay')).toBeInTheDocument();
  });
});

