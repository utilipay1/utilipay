import { render, screen } from '@testing-library/react';
import Home from './page';

// Mock dependencies
jest.mock('@/components/dashboard/DashboardAlerts', () => ({
  DashboardAlerts: () => <div data-testid="dashboard-alerts" />
}));
jest.mock('@/components/dashboard/PortfolioTable', () => ({
  PortfolioTable: () => <div data-testid="portfolio-table" />
}));
jest.mock('@/components/dashboard/SummaryTiles', () => ({
  SummaryTiles: () => <div data-testid="summary-tiles" />
}));
jest.mock('@/components/properties/PropertiesView', () => ({
  PropertiesView: () => <div data-testid="properties-view" />
}));
jest.mock('@/components/bills/BillList', () => ({
  BillList: () => <div data-testid="bill-list" />
}));

const mockUseView = jest.fn();
jest.mock('@/context/ViewContext', () => ({
  useView: () => mockUseView()
}));

describe('Home Page', () => {
  beforeEach(() => {
    mockUseView.mockReset();
  });

  it('should render Dashboard view logic', () => {
    mockUseView.mockReturnValue({ currentView: 'dashboard' });
    render(<Home />);
    // Check for dashboard elements
    expect(screen.getByTestId('summary-tiles')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-alerts')).toBeInTheDocument();
    expect(screen.getByTestId('portfolio-table')).toBeInTheDocument();
    
    // Check absence of other views
    expect(screen.queryByTestId('properties-view')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bill-list')).not.toBeInTheDocument();
  });

  it('should render Properties view logic', () => {
    mockUseView.mockReturnValue({ currentView: 'properties' });
    render(<Home />);
    expect(screen.getByTestId('properties-view')).toBeInTheDocument();
    expect(screen.queryByTestId('summary-tiles')).not.toBeInTheDocument();
  });

  it('should render Bills view logic', () => {
    mockUseView.mockReturnValue({ currentView: 'bills' });
    render(<Home />);
    expect(screen.getByTestId('bill-list')).toBeInTheDocument();
    expect(screen.queryByTestId('summary-tiles')).not.toBeInTheDocument();
  });
});