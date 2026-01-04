import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { PropertySchema } from '@/lib/schemas';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = PropertySchema.parse(body);

    const client = await clientPromise;
    const db = client.db('utilipay');
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...propertyData } = validatedData;
    
    const result = await db.collection('properties').insertOne({
      ...propertyData,
      createdAt: new Date(),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return NextResponse.json({ error: (error as any).errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const showArchived = searchParams.get('archived') === 'true';

    const client = await clientPromise;
    const db = client.db('utilipay');

    const query = showArchived ? { is_archived: true } : { is_archived: { $ne: true } };

    const properties = await db
      .collection('properties')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(properties);
  } catch (error) {
    console.error("GET /api/properties error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      raw: error
    });
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
  }
}
