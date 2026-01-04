import { addDays, differenceInCalendarDays } from 'date-fns';

export interface BillInput {
  property_id: string;
  utility_type: 'Water' | 'Sewer' | 'Gas' | 'Electric';
  amount: number;
  account_number?: string;
  billing_period_start: Date;
  billing_period_end: Date;
  bill_date: Date;
  due_date: Date;
}

export function calculateNextBill(currentBill: BillInput) {
  const periodDuration = differenceInCalendarDays(currentBill.billing_period_end, currentBill.billing_period_start);
  
  const nextStart = addDays(currentBill.billing_period_end, 1);
  const nextEnd = addDays(nextStart, periodDuration);
  
  // Shift bill and due dates by the full cycle length (duration + 1 day to account for inclusive start)
  const cycleLength = periodDuration + 1;
  const nextBillDate = addDays(currentBill.bill_date, cycleLength);
  const nextDueDate = addDays(currentBill.due_date, cycleLength);

  return {
    property_id: currentBill.property_id,
    utility_type: currentBill.utility_type,
    amount: 0,
    account_number: currentBill.account_number,
    billing_period_start: nextStart,
    billing_period_end: nextEnd,
    bill_date: nextBillDate,
    due_date: nextDueDate,
    status: 'Unpaid' as const,
  };
}

export function getAlertStatus(dueDate: Date, referenceDate: Date = new Date()) {
  const daysUntilDue = differenceInCalendarDays(dueDate, referenceDate);

  if (daysUntilDue <= 1) {
    return 'Critical';
  }
  if (daysUntilDue <= 3) {
    return 'Warning';
  }
  if (daysUntilDue <= 5) {
    return 'Info';
  }

  return null;
}
