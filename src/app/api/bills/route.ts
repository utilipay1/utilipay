import { NextRequest, NextResponse } from 'next/server';
import clientPromise, { DB_NAME } from '@/lib/mongodb';
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
    const db = client.db(DB_NAME);
    
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
    const db = client.db(DB_NAME);
    
    // Initial Match Stage (Filters on Bill fields)
    const matchStage: Record<string, unknown> = {
      userId: session.user.id
    };

    if (status) {
      const statuses = status.split(',');
      if (statuses.length > 0) matchStage.status = { $in: statuses };
    }

    if (utilityType) {
      const types = utilityType.split(',');
      if (types.length > 0) matchStage.utility_type = { $in: types };
    }

    if (propertyId) {
       matchStage.property_id = propertyId;
    }

    if (showArchived) {
      matchStage.is_archived = true;
    } else {
      matchStage.is_archived = { $ne: true };
    }

    // Pipeline Construction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pipeline: any[] = [
      { $match: matchStage },
      // Join Property
      {
        $lookup: {
          from: 'properties',
          let: { pid: '$property_id' },
          pipeline: [
            { 
              $match: { 
                $expr: { $eq: ['$_id', { $toObjectId: '$$pid' }] } 
              } 
            },
            { $project: { address: 1, utility_companies: 1 } }
          ],
          as: 'property'
        }
      },
      { $unwind: { path: '$property', preserveNullAndEmptyArrays: true } }
    ];

    // Search Stage (Filter on Joined Property Address)
    if (search) {
      pipeline.push({
        $match: {
          'property.address': { $regex: search, $options: 'i' }
        }
      });
    }

    // Facet for Data + Count
    pipeline.push({
      $facet: {
        data: [
          { $sort: { due_date: 1 } },
          { $skip: skip },
          { $limit: limit }
        ],
        metadata: [
          { $count: 'total' }
        ]
      }
    });

    const result = await db.collection('bills').aggregate(pipeline).toArray();
    
    const bills = result[0].data;
    const total = result[0].metadata[0]?.total || 0;

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
