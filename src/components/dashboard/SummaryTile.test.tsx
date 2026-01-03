import { render, screen } from '@testing-library/react';
import { SummaryTile } from './SummaryTile';

const mockBills = [
  { _id: '1', property_id: 'p1', utility_type: 'Water', amount: 100, due_date: '2026-01-10', status: 'Pending' },
  { _id: '2', property_id: 'p2', utility_type: 'Gas', amount: 50, due_date: '2026-01-12', status: 'Pending' },
  { _id: '3', property_id: 'p3', utility_type: 'Electricity', amount: 200, due_date: '2026-01-15', status: 'Pending' },
];

describe('SummaryTile', () => {
  it('should display total due amount', () => {
    render(<SummaryTile bills={mockBills} />);
    // Total = 100 + 50 + 200 = 350
    expect(screen.getByText(/\$350/)).toBeInTheDocument();
  });

  it('should list next 3 bills', () => {
    render(<SummaryTile bills={mockBills} />);
    expect(screen.getByText('Water')).toBeInTheDocument();
    expect(screen.getByText('Gas')).toBeInTheDocument();
    expect(screen.getByText('Electricity')).toBeInTheDocument();
  });
});
