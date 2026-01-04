import { calculateNextBill, getAlertStatus } from './billing';
import { addDays, subDays } from 'date-fns';

describe('billing logic', () => {
  describe('calculateNextBill', () => {
    it('generates a draft bill for the next 30-day cycle', () => {
      const currentBill = {
        property_id: 'prop-1',
        utility_type: 'Water' as const,
        amount: 100,
        account_number: 'ACC-123',
        billing_period_start: new Date('2026-01-01'),
        billing_period_end: new Date('2026-01-31'),
        bill_date: new Date('2026-02-01'),
        due_date: new Date('2026-02-15'),
      };

      const nextBill = calculateNextBill(currentBill);

      expect(nextBill.property_id).toBe(currentBill.property_id);
      expect(nextBill.utility_type).toBe(currentBill.utility_type);
      expect(nextBill.amount).toBe(0); // Draft should be 0 or same? Spec says "placeholder"
      expect(nextBill.status).toBe('Unpaid');
      expect(nextBill.account_number).toBe('ACC-123'); // Should persist
      
      // Check dates
      // Current: Jan 1 - Jan 31 (31 days). Diff = 30.
      // Next Start: Feb 1.
      // Next End: Feb 1 + 30 days = Mar 3 (2026 is not a leap year).
      expect(nextBill.billing_period_start).toEqual(new Date('2026-02-01'));
      expect(nextBill.billing_period_end).toEqual(new Date('2026-03-03'));
      
      // Bill Date: Feb 1 + 31 days = Mar 4.
      expect(nextBill.bill_date).toEqual(new Date('2026-03-04'));
    });
  });

  describe('getAlertStatus', () => {
    const today = new Date('2026-01-10');

    it('returns Critical for bills due in 1 day', () => {
      const dueDate = addDays(today, 1);
      expect(getAlertStatus(dueDate, today)).toBe('Critical');
    });

    it('returns Warning for bills due in 3 days', () => {
      const dueDate = addDays(today, 3);
      expect(getAlertStatus(dueDate, today)).toBe('Warning');
    });

    it('returns Info for bills due in 5 days', () => {
      const dueDate = addDays(today, 5);
      expect(getAlertStatus(dueDate, today)).toBe('Info');
    });

    it('returns null for bills due much later', () => {
      const dueDate = addDays(today, 10);
      expect(getAlertStatus(dueDate, today)).toBe(null);
    });

    it('returns Critical for overdue bills', () => {
      const dueDate = subDays(today, 1);
      expect(getAlertStatus(dueDate, today)).toBe('Critical');
    });
  });
});
