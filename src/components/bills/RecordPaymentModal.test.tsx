import { render, screen, fireEvent } from '@testing-library/react';
import { RecordPaymentModal } from './RecordPaymentModal';

// Mock fetch
global.fetch = jest.fn();

const mockBill = {
  _id: 'bill1',
  property_id: 'prop1',
  utility_type: 'Water' as const,
  amount: 50,
  status: 'Unpaid' as const,
  due_date: new Date().toISOString(),
  billing_period_start: new Date().toISOString(),
  billing_period_end: new Date().toISOString(),
  bill_date: new Date().toISOString()
};

describe('RecordPaymentModal Redesign', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it('should display read-only header info', () => {
    render(<RecordPaymentModal bill={mockBill} onPaymentRecorded={() => {}} />);
    
    // Open modal
    fireEvent.click(screen.getByText(/Record Payment/i));
    
    expect(screen.getByText('Water')).toBeInTheDocument();
    // Bill amount should be there (multiple times is okay for existence check)
    expect(screen.getAllByText(/₹50/i).length).toBeGreaterThan(0);
  });

  it('should calculate Total Paid correctly', async () => {
    render(<RecordPaymentModal bill={mockBill} onPaymentRecorded={() => {}} />);
    
    // Open modal
    fireEvent.click(screen.getByText(/Record Payment/i));
    
    const feeInput = screen.getByLabelText(/Service\/Convenience Fee/i);
    fireEvent.change(feeInput, { target: { value: '1.50' } });
    
    // Total Paid should be 50 + 1.50 = 51.50
    // The component renders "Total Paid:" and "₹51.5" separately or together?
    // Let's check the implementation: "Total Paid:" and "₹51.5" are separate spans
    expect(screen.getByText('Total Paid:')).toBeInTheDocument();
    expect(screen.getByText(/₹51.5/i)).toBeInTheDocument();
  });

  it('should show other specification field when Other is selected', async () => {
    render(<RecordPaymentModal bill={mockBill} onPaymentRecorded={() => {}} />);
    
    // Open modal
    fireEvent.click(screen.getByText(/Record Payment/i));
    
    expect(screen.queryByLabelText(/Please specify/i)).not.toBeInTheDocument();
    
    fireEvent.change(screen.getByLabelText(/Payment Method/i), { target: { value: 'Other' } });
    
    expect(screen.getByLabelText(/Please specify/i)).toBeInTheDocument();
  });
});
