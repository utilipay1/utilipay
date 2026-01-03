import { render, screen } from '@testing-library/react';
import { PropertiesView } from './PropertiesView';

// Mock child components
jest.mock('./PropertyList', () => ({
  PropertyList: () => <div data-testid="property-list" />
}));
jest.mock('./AddPropertyModal', () => ({
  AddPropertyModal: ({ trigger }: { trigger: React.ReactNode }) => (
    <div data-testid="add-property-modal">{trigger}</div>
  )
}));

describe('PropertiesView', () => {
  it('should render the view title and search input', () => {
    render(<PropertiesView />);
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
  });

  it('should render the Add Property button inside a modal trigger', () => {
    render(<PropertiesView />);
    expect(screen.getByTestId('add-property-modal')).toBeInTheDocument();
    expect(screen.getByText('Add Property')).toBeInTheDocument();
  });

  it('should render the PropertyList', () => {
    render(<PropertiesView />);
    expect(screen.getByTestId('property-list')).toBeInTheDocument();
  });
});
