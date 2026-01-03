import { addDays, differenceInCalendarDays } from 'date-fns';

export interface BillInput {
  property_id: string;
  utility_type: 'Water' | 'Sewer' | 'Gas' | 'Electric';
  amount: number;
  billing_period_start: Date;
  billing_period_end: Date;
  bill_date: Date;
  due_date: Date;
}

export function calculateNextBill(currentBill: BillInput) {
  const nextStart = addDays(currentBill.billing_period_end, 1);
  const nextEnd = addDays(nextStart, 29); // 30-day cycle inclusive
  const nextBillDate = addDays(currentBill.bill_date, 30);
  const nextDueDate = addDays(currentBill.due_date, 30);

  return {
    property_id: currentBill.property_id,
    utility_type: currentBill.utility_type,
    amount: 0,
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
