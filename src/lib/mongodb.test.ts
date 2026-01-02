import clientPromise from './mongodb';

jest.mock('mongodb', () => {
  return {
    MongoClient: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue('mock-client'),
    })),
    ServerApiVersion: {
      v1: '1',
    },
  };
});

describe('MongoDB Connection', () => {
  it('should export a client promise', async () => {
    expect(clientPromise).toBeDefined();
    const client = await clientPromise;
    expect(client).toBeDefined();
  });
});
