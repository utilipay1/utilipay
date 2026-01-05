import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { BillSchema } from '@/lib/schemas';
import { calculateNextBill } from '@/lib/billing';
import { ZodError } from 'zod';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = BillSchema.parse(body);

    const client = await clientPromise;
    const db = client.db('utilipay');
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...billData } = validatedData;

    const currentBill = {
      ...billData,
      userId: session.user.id, // Inject user ownership
      createdAt: new Date(),
    };

    // Predictive billing: Generate next draft
    const nextDraft = calculateNextBill(validatedData);
    
    const result = await db.collection('bills').insertMany([
      currentBill,
      { ...nextDraft, userId: session.user.id, createdAt: new Date() }
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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');
    const showArchived = searchParams.get('archived') === 'true';

    const client = await clientPromise;
    const db = client.db('utilipay');
    
    // Build query
    const query: Record<string, unknown> = {
      userId: session.user.id // Filter by user ownership
    };
    
    if (propertyId) {
      query.property_id = propertyId;
    }

    if (showArchived) {
      query.is_archived = true;
    } else {
      query.is_archived = { $ne: true };
    }

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
