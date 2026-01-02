import { PropertySchema, BillSchema } from './schemas';

describe('Zod Schemas', () => {
  it('should validate a correct Property', () => {
    const validProperty = {
      address: '123 Main St',
      owner_info: { name: 'John Doe', contact: 'john@example.com' },
      tenant_status: 'Occupied',
      tenant_info: { name: 'Jane Doe', contact: 'jane@example.com' },
      utilities_managed: ['Water', 'Electric'],
      notes: 'Some notes',
      is_archived: false,
    };
    const result = PropertySchema.safeParse(validProperty);
    expect(result.success).toBe(true);
  });

  it('should fail on invalid Property', () => {
    const invalidProperty = {
      address: '', // empty address should fail
    };
    const result = PropertySchema.safeParse(invalidProperty);
    expect(result.success).toBe(false);
  });

  it('should validate a correct Bill', () => {
    const validBill = {
      property_id: 'some-id',
      utility_type: 'Water',
      amount: 100.50,
      account_number: 'ACC123',
      billing_period_start: new Date(),
      billing_period_end: new Date(),
      bill_date: new Date(),
      due_date: new Date(),
      status: 'Unpaid',
    };
    const result = BillSchema.safeParse(validBill);
    expect(result.success).toBe(true);
  });
});
