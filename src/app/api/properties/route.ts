import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { PropertySchema } from '@/lib/schemas';
import { ZodError } from 'zod';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = PropertySchema.parse(body);

    const client = await clientPromise;
    const db = client.db('utilipay');
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...propertyData } = validatedData;
    
    const result = await db.collection('properties').insertOne({
      ...propertyData,
      userId: session.user.id, // Inject user ownership
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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const archivedParam = searchParams.get('archived');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db('utilipay');

    const query: Record<string, unknown> = {
      userId: session.user.id // Filter by user ownership
    };

    if (archivedParam === 'all') {
      // No extra filter
    } else if (archivedParam === 'true') {
      query.is_archived = true;
    } else {
      query.is_archived = { $ne: true };
    }

    const [properties, total] = await Promise.all([
      db.collection('properties')
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('properties').countDocuments(query)
    ]);

    return NextResponse.json({
      data: properties,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("GET /api/properties error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      raw: error
    });
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
  }
}
