import { render, screen } from '@testing-library/react';
import Navbar from './Navbar';

// Mock fetch for alerts
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
) as jest.Mock;

describe('Navbar Redesign', () => {
  it('should not contain redundant navigation links', () => {
    render(<Navbar />);
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Properties')).not.toBeInTheDocument();
    expect(screen.queryByText('Bills')).not.toBeInTheDocument();
  });

  it('should not contain global notification button', () => {
    render(<Navbar />);
    expect(screen.queryByLabelText('Notifications')).not.toBeInTheDocument();
  });

  it('should contain UtiliPay branding', () => {
    render(<Navbar />);
    expect(screen.getByText('UtiliPay')).toBeInTheDocument();
  });
});
