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
  billing_period_start: z.coerce.date(),
  billing_period_end: z.coerce.date(),
  bill_date: z.coerce.date(),
  due_date: z.coerce.date(),
  status: z.enum(['Unpaid', 'Overdue', 'Paid-Uncharged', 'Paid-Charged']),
  notes: z.string().optional(),
  is_archived: z.boolean().default(false),
  payment: z.object({
    payment_date: z.coerce.date(),
    method: z.string(),
    confirmation_code: z.string().optional(),
    service_fee: z.number().min(0).default(0),
  }).optional(),
});
