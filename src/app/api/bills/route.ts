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
    const showArchived = searchParams.get('archived') === 'true';
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status');
    const utilityType = searchParams.get('utility_type');
    const propertyId = searchParams.get('propertyId');
    const search = searchParams.get('search');

    const client = await clientPromise;
    const db = client.db('utilipay');
    
    // Build query
    const query: Record<string, unknown> = {
      userId: session.user.id // Filter by user ownership
    };

    // 1. Handle Search (Address lookup)
    if (search) {
      const matchingProps = await db.collection('properties')
        .find({ 
          userId: session.user.id,
          address: { $regex: search, $options: 'i' } 
        })
        .project({ _id: 1 })
        .toArray();
      
      const propIds = matchingProps.map(p => p._id.toString());
      
      // If propertyId filter is also set, intersection is needed
      if (propertyId) {
        if (propIds.includes(propertyId)) {
          query.property_id = propertyId;
        } else {
          // Search found properties, but none match the specific propertyId filter
          // So result should be empty
          query.property_id = { $in: [] }; 
        }
      } else {
        query.property_id = { $in: propIds };
      }
    } else if (propertyId) {
      query.property_id = propertyId;
    }

    // 2. Other Filters
    if (status) {
      // Allow comma-separated statuses
      const statuses = status.split(',');
      if (statuses.length > 0) {
        query.status = { $in: statuses };
      }
    }

    if (utilityType) {
      const types = utilityType.split(',');
      if (types.length > 0) {
        query.utility_type = { $in: types };
      }
    }

    if (showArchived) {
      query.is_archived = true;
    } else {
      query.is_archived = { $ne: true };
    }

    const [bills, total] = await Promise.all([
      db.collection('bills')
        .find(query)
        .sort({ due_date: 1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('bills').countDocuments(query)
    ]);

    return NextResponse.json({
      data: bills,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("GET /api/bills error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
