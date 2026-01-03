/**
 * @jest-environment node
 */
import { POST, GET } from './route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: Promise.resolve({
    db: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        insertOne: jest.fn().mockResolvedValue({ acknowledged: true, insertedId: 'mock-id' }),
        find: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([
              { _id: '1', address: 'Property 1', is_archived: false },
              { _id: '2', address: 'Property 2', is_archived: false },
            ]),
          }),
        }),
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

describe('GET /api/properties', () => {
  it('should return a list of properties', async () => {
    const req = new NextRequest('http://localhost:3000/api/properties');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0].address).toBe('Property 1');
  });
});
