import clientPromise, { DB_NAME } from './mongodb';

export async function ensureIndexes() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  console.log(`Setting up indexes for database: ${DB_NAME}`);

  // Bills Collection
  const bills = db.collection('bills');
  await bills.createIndex({ userId: 1 });
  await bills.createIndex({ property_id: 1 });
  await bills.createIndex({ status: 1 });
  await bills.createIndex({ due_date: 1 });
  await bills.createIndex({ userId: 1, due_date: 1 }); // Compound for user-specific sorts

  // Properties Collection
  const properties = db.collection('properties');
  await properties.createIndex({ userId: 1 });
  // Case-insensitive index for address search
  await properties.createIndex(
    { address: 1 },
    { collation: { locale: 'en', strength: 2 } }
  );

  // Companies Collection
  const companies = db.collection('companies');
  await companies.createIndex({ userId: 1 });

  // Notes Collection
  const notes = db.collection('user_notes');
  await notes.createIndex({ userId: 1 });

  console.log('Indexes ensured successfully.');
}
