import { render, screen } from '@testing-library/react';
import { BillsView } from './BillsView';

// Mock components
jest.mock('./BillList', () => ({
  BillList: () => <div data-testid="bill-list" />
}));
jest.mock('./ExportBillsButton', () => ({
  ExportBillsButton: () => <div data-testid="export-bills-button" />
}));
jest.mock('./AddBillModal', () => ({
  AddBillModal: ({ trigger }: { trigger: React.ReactNode }) => (
    <div data-testid="add-bill-modal">{trigger}</div>
  )
}));

describe('BillsView', () => {
  it('should render the view title and management components', () => {
    render(<BillsView />);
    expect(screen.getByText('Bills')).toBeInTheDocument();
    expect(screen.getByTestId('export-bills-button')).toBeInTheDocument();
    expect(screen.getByTestId('add-bill-modal')).toBeInTheDocument();
    expect(screen.getByText('Add Bill')).toBeInTheDocument();
  });

  it('should render the BillList', () => {
    render(<BillsView />);
    expect(screen.getByTestId('bill-list')).toBeInTheDocument();
  });
});
