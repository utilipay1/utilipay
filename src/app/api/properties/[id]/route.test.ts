/**
 * @jest-environment node
 */
import { PATCH } from './route';
import clientPromise from '@/lib/mongodb';
import { NextRequest } from 'next/server';

jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: Promise.resolve({
    db: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        updateOne: jest.fn().mockResolvedValue({ acknowledged: true, modifiedCount: 1 }),
      }),
    }),
  }),
}));

describe('PATCH /api/properties/[id]', () => {
  it('should archive a property', async () => {
    const validId = '507f1f77bcf86cd799439011';
    const req = new NextRequest(`http://localhost:3000/api/properties/${validId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_archived: true }),
    });

    // In Next.js 15, params are passed as second argument to the handler
    const response = await PATCH(req, { params: Promise.resolve({ id: validId }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.modifiedCount).toBe(1);
  });

  it('should return 404 if property not found', async () => {
    const validId = '507f1f77bcf86cd799439011';
    
    // Mock updateOne to return matchedCount 0
    const client = await clientPromise;
    (client.db().collection('properties').updateOne as jest.Mock).mockResolvedValueOnce({
      acknowledged: true,
      matchedCount: 0,
    });

    const req = new NextRequest(`http://localhost:3000/api/properties/${validId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_archived: true }),
    });

    const response = await PATCH(req, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(404);
  });
});
