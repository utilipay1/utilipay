import { z } from 'zod';

export const PropertySchema = z.object({
  _id: z.string().optional(), // MongoDB ID
  address: z.string().min(1, "Address is required"),
  owner_info: z.object({
    name: z.string().optional(),
    contact: z.string().optional(),
  }).optional(),
  tenant_status: z.enum(['Vacant', 'Occupied']),
  tenant_info: z.object({
    name: z.string().optional(),
    contact: z.string().optional(),
  }).optional(),
  utilities_managed: z.array(z.enum(['Water', 'Sewer', 'Gas', 'Electric'])),
  notes: z.string().optional(),
  is_archived: z.boolean().default(false),
});

export const BillSchema = z.object({
  _id: z.string().optional(),
  property_id: z.string().min(1, "Property ID is required"),
  utility_type: z.enum(['Water', 'Sewer', 'Gas', 'Electric']),
  amount: z.number().min(0),
  account_number: z.string().optional(),
  billing_period_start: z.date(),
  billing_period_end: z.date(),
  bill_date: z.date(),
  due_date: z.date(),
  status: z.enum(['Unpaid', 'Overdue', 'Paid-Uncharged', 'Paid-Charged']),
  notes: z.string().optional(),
  payment: z.object({
    payment_date: z.date(),
    method: z.enum(['AGR Trust Account', 'Credit Card', 'Bank Transfer', 'Check', 'Other']),
    confirmation_code: z.string().optional(),
    service_fee: z.number().min(0).default(0),
  }).optional(),
});
