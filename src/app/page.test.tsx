import { render, screen } from '@testing-library/react';
import Home from './page';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
) as jest.Mock;

jest.mock('@/components/dashboard/BillsDueSoon', () => ({
  BillsDueSoon: () => <div data-testid="bills-due-soon" />
}));
jest.mock('@/components/dashboard/PortfolioTable', () => ({
  PortfolioTable: () => <div data-testid="portfolio-table" />
}));

describe('Home Page', () => {
  it('should render the dashboard title', () => {
    render(<Home />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  it('should render navigation tabs', () => {
    render(<Home />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByText('All Bills')).toBeInTheDocument();
    expect(screen.getByText('Manage')).toBeInTheDocument();
  });
});


