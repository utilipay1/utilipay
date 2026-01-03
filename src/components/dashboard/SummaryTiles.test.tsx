import { render, screen } from '@testing-library/react';
import { SummaryTiles } from './SummaryTiles';

const mockBills = [
  { _id: '1', property_id: 'p1', utility_type: 'Water', amount: 100, due_date: '2026-01-10', status: 'Unpaid' },
  { _id: '2', property_id: 'p2', utility_type: 'Gas', amount: 50, due_date: '2026-01-12', status: 'Paid' },
  { _id: '3', property_id: 'p3', utility_type: 'Electricity', amount: 200, due_date: '2026-01-15', status: 'Unpaid' },
];

const mockProperties = [
  { _id: 'prop1', address: '123 Main St' },
  { _id: 'prop2', address: '456 Oak Ave' },
];

describe('SummaryTiles', () => {
  it('should display correct summary metrics', () => {
    render(<SummaryTiles bills={mockBills} properties={mockProperties} />);
    
    // Total Due = 100 + 200 = 300
    expect(screen.getByText('Total Due')).toBeInTheDocument();
    expect(screen.getByText(/₹300/)).toBeInTheDocument();
    
    // Total Paid = 50
    expect(screen.getByText('Total Paid')).toBeInTheDocument();
    expect(screen.getByText(/₹50/)).toBeInTheDocument();
    
    // Properties Managed = 2
    expect(screen.getByText('Properties Managed')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
