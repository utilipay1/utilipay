import { render, screen } from '@testing-library/react';
import Navbar from './Navbar';

// Mock fetch
global.fetch = jest.fn();

describe('Navbar', () => {
  it('should render brand name', () => {
    render(<Navbar />);
    expect(screen.getByText('UtiliPay')).toBeInTheDocument();
  });
});

