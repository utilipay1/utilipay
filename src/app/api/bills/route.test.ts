/**
 * @jest-environment node
 */
import { POST } from './route';
import { NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Collection, Db, MongoClient } from 'mongodb';

// Mock types
type MockCollection = Partial<Collection> & {
  insertOne: jest.Mock;
  find: jest.Mock;
  insertMany: jest.Mock;
};

type MockDb = Partial<Db> & {
  collection: jest.Mock<MockCollection>;
};

type MockClient = Partial<MongoClient> & {
  db: jest.Mock<MockDb>;
};

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
        insertMany: jest.fn().mockResolvedValue({ acknowledged: true, insertedCount: 2 }),
      }),
    }),
  }),
}));

describe('POST /api/bills', () => {
  it('should create a new bill and a predictive draft bill', async () => {
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

    const mockInsertMany = jest.fn().mockResolvedValue({ acknowledged: true, insertedCount: 2 });
    
    const client = (await clientPromise) as unknown as MockClient;
    // We need to cast through unknown to avoid TS errors with the mock structure
    (client.db().collection('bills').insertMany as jest.Mock) = mockInsertMany;

    const req = new NextRequest('http://localhost:3000/api/bills', {
      method: 'POST',
      body: JSON.stringify(billData),
    });

    const response = await POST(req);
    await response.json();

    expect(response.status).toBe(201);
    expect(mockInsertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ status: 'Unpaid', amount: 50.0 }), // Current bill
        expect.objectContaining({ status: 'Unpaid', amount: 0 }),    // Predictive draft
      ])
    );
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

    const { GET } = await import('./route');
    const client = (await clientPromise) as unknown as MockClient;
    
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
