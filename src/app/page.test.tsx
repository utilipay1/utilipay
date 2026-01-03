import { render, screen } from '@testing-library/react';
import Home from './page';
import '@testing-library/jest-dom';

// Mock subcomponents
jest.mock('@/components/properties/AddPropertyForm', () => ({
  AddPropertyForm: () => <div data-testid="add-property-form" />
}));
jest.mock('@/components/properties/PropertyList', () => ({
  PropertyList: () => <div data-testid="property-list" />
}));
jest.mock('@/components/bills/AddBillForm', () => ({
  AddBillForm: () => <div data-testid="add-bill-form" />
}));
jest.mock('@/components/bills/BillList', () => ({
  BillList: () => <div data-testid="bill-list" />
}));
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


