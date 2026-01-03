import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { BillSchema } from '@/lib/schemas';
import { calculateNextBill } from '@/lib/billing';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = BillSchema.parse(body);

    const client = await clientPromise;
    const db = client.db('utilipay');
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...billData } = validatedData;

    const currentBill = {
      ...billData,
      createdAt: new Date(),
    };

    // Predictive billing: Generate next draft
    const nextDraft = calculateNextBill(validatedData);
    
    const result = await db.collection('bills').insertMany([
      currentBill,
      { ...nextDraft, createdAt: new Date() }
    ]);

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return NextResponse.json({ error: (error as any).errors }, { status: 400 });
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
    console.error("GET /api/bills error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
