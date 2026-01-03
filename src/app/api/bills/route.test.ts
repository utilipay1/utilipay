/**
 * @jest-environment node
 */
import { POST } from './route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: Promise.resolve({
    db: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        insertOne: jest.fn().mockResolvedValue({ acknowledged: true, insertedId: 'mock-bill-id' }),
        find: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    }),
  }),
}));

describe('POST /api/bills', () => {
  it('should create a new bill', async () => {
    const billData = {
      property_id: '507f1f77bcf86cd799439011',
      utility_type: 'Water',
      amount: 50.0,
      billing_period_start: '2026-01-01T00:00:00.000Z',
      billing_period_end: '2026-01-31T00:00:00.000Z',
      bill_date: '2026-02-01T00:00:00.000Z',
      due_date: '2026-02-15T00:00:00.000Z',
      status: 'Unpaid',
    };

    const req = new NextRequest('http://localhost:3000/api/bills', {
      method: 'POST',
      body: JSON.stringify(billData),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.insertedId).toBe('mock-bill-id');
  });

  it('should return 400 if validation fails', async () => {
    const req = new NextRequest('http://localhost:3000/api/bills', {
      method: 'POST',
      body: JSON.stringify({}), // Missing required fields
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });
});

describe('GET /api/bills', () => {
  it('should return a list of bills', async () => {
    const mockBills = [
      { _id: '1', property_id: 'prop-1', amount: 100 },
      { _id: '2', property_id: 'prop-2', amount: 200 },
    ];

    const { GET } = require('./route');
    const clientPromise = require('@/lib/mongodb').default;
    const client = await clientPromise;
    
    (client.db().collection('bills').find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockBills),
      }),
    });

    const req = new NextRequest('http://localhost:3000/api/bills');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
  });
});
