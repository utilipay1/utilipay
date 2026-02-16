import { z } from 'zod';

export const CompanySchema = z.object({
  _id: z.string().optional(),
  userId: z.string().optional(),
  name: z.string().min(1, "Company name is required"),
  service_type: z.enum(['Water', 'Sewer', 'Gas', 'Electric']),
  contact_info: z.object({
    phone: z.string().nullish(),
    website: z.string().nullish(),
    email: z.string().nullish(),
  }).optional(),
  createdAt: z.coerce.date().optional(),
});

export const PropertySchema = z.object({
  _id: z.string().optional(), // MongoDB ID
  userId: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  owner_info: z.object({
    name: z.string().nullish(),
    contact: z.string().nullish(),
  }).optional(),
  tenant_status: z.enum(['Vacant', 'Occupied']),
  tenant_info: z.object({
    name: z.string().nullish(),
    contact: z.string().nullish(),
  }).optional(),
  utilities_managed: z.array(z.enum(['Water', 'Sewer', 'Gas', 'Electric'])),
  // Map of Utility Type -> Company ID
  utility_companies: z.record(z.string(), z.string()).optional(), 
  notes: z.string().nullish(),
  is_archived: z.boolean().default(false),
});

export const BillSchema = z.object({
  _id: z.string().optional(),
  userId: z.string().optional(),
  property_id: z.string().min(1, "Property ID is required"),
  utility_type: z.enum(['Water', 'Sewer', 'Gas', 'Electric']),
  amount: z.number().min(0),
  account_number: z.string().nullish(), // Allow null or undefined
  billing_period_start: z.coerce.date(),
  billing_period_end: z.coerce.date(),
  bill_date: z.coerce.date(),
  due_date: z.coerce.date(),
  status: z.enum(['Unpaid', 'Overdue', 'Paid']),
  billed_to: z.enum(['None', 'Owner', 'Tenant']).default('None'),
  notes: z.string().nullish(), // Allow null or undefined
  is_archived: z.boolean().default(false),
  payment: z.object({
    payment_date: z.coerce.date(),
    method: z.string(),
    confirmation_code: z.string().nullish(), // Allow null or undefined
    service_fee: z.number().min(0).default(0),
  }).optional(),
});

export const UserNoteSchema = z.object({
  _id: z.string().optional(),
  userId: z.string().optional(),
  content: z.string().min(1, "Note content cannot be empty"),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
