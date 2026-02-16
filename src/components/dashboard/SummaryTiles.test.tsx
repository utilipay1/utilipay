import { render, screen } from '@testing-library/react';
import { SummaryTiles } from './SummaryTiles';
import { startOfMonth, subMonths } from 'date-fns';

const currentMonthDate = startOfMonth(new Date()).toISOString();
const lastMonthDate = subMonths(new Date(), 1).toISOString();

const mockBills = [
  { _id: '1', property_id: 'p1', utility_type: 'Water', amount: 100, due_date: '2026-01-10', status: 'Unpaid' },
  // Paid this month
  { 
    _id: '2', 
    property_id: 'p2', 
    utility_type: 'Gas', 
    amount: 50, 
    due_date: '2026-01-12', 
    status: 'Paid',
    payment: { payment_date: currentMonthDate }
  },
  // Paid last month (should be ignored)
  { 
    _id: '4', 
    property_id: 'p2', 
    utility_type: 'Gas', 
    amount: 75, 
    due_date: '2025-12-12', 
    status: 'Paid',
    payment: { payment_date: lastMonthDate }
  },
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
    
    // Paid This Month = 50 (ignoring the 75 from last month)
    expect(screen.getByText('Paid This Month')).toBeInTheDocument();
    expect(screen.getByText(/₹50/)).toBeInTheDocument();
    
    // Properties Managed = 2
    expect(screen.getByText('Properties Managed')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
