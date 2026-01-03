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

describe('Home Page', () => {
  it('should render the management title', () => {
    render(<Home />);
    expect(screen.getByText(/Utilipay Management/i)).toBeInTheDocument();
  });

  it('should render the tabs', () => {
    render(<Home />);
    // Use role or more specific text to avoid multiple matches
    expect(screen.getByRole('tab', { name: /Properties/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Add Property/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Add Bill/i })).toBeInTheDocument();
  });
});
