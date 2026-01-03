/**
 * @jest-environment node
 */
import { POST } from './route';
import clientPromise from '@/lib/mongodb';
import { NextRequest } from 'next/server';

jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: Promise.resolve({
    db: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        insertOne: jest.fn().mockResolvedValue({ acknowledged: true, insertedId: 'mock-id' }),
      }),
    }),
  }),
}));

describe('POST /api/properties', () => {
  it('should create a new property', async () => {
    const propertyData = {
      address: '123 Test St',
      tenant_status: 'Vacant',
      utilities_managed: ['Water'],
    };

    const req = new NextRequest('http://localhost:3000/api/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.insertedId).toBe('mock-id');
  });

  it('should return 400 if validation fails', async () => {
    const req = new NextRequest('http://localhost:3000/api/properties', {
      method: 'POST',
      body: JSON.stringify({}), // Missing required fields
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });
});
