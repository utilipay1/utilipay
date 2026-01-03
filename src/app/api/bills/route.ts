import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { BillSchema } from '@/lib/schemas';
import { calculateNextBill } from '@/lib/billing';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = BillSchema.parse(body);

    const client = await clientPromise;
    const db = client.db('utilipay');
    
    const currentBill = {
      ...validatedData,
      createdAt: new Date(),
    };

    // Predictive billing: Generate next draft
    const nextDraft = calculateNextBill(validatedData);
    
    const result = await db.collection('bills').insertMany([
      currentBill,
      { ...nextDraft, createdAt: new Date() }
    ]);

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('POST /api/bills error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');

    const client = await clientPromise;
    const db = client.db('utilipay');
    
    const query = propertyId ? { property_id: propertyId } : {};
    const bills = await db
      .collection('bills')
      .find(query)
      .sort({ due_date: 1 })
      .toArray();

    return NextResponse.json(bills);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
