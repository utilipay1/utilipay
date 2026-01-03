import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecordPaymentModal } from './RecordPaymentModal';

// Mock fetch
global.fetch = jest.fn();

const mockBill = {
  _id: 'bill1',
  property_id: 'prop1',
  utility_type: 'Electric',
  amount: 100,
  status: 'Unpaid',
};

describe('RecordPaymentModal', () => {
  it('submits payment details correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<RecordPaymentModal bill={mockBill} onPaymentRecorded={jest.fn()} />);

    // Open modal
    fireEvent.click(screen.getByText(/Record Payment/));

    // Fill form
    fireEvent.change(screen.getByLabelText(/Payment Method/), { target: { value: 'Credit Card' } });
    fireEvent.change(screen.getByLabelText(/Confirmation Code/), { target: { value: 'CONF123' } });
    fireEvent.change(screen.getByLabelText(/Payment Date/), { target: { value: '2026-01-03' } });
    
    // Submit
    fireEvent.click(screen.getByText(/Confirm Payment/));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/bills/bill1'),
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('Paid-Uncharged'),
        })
      );
    });
  });
});

