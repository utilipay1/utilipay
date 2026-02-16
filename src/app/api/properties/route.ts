import { NextRequest, NextResponse } from 'next/server';
import clientPromise, { DB_NAME } from '@/lib/mongodb';
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
    const db = client.db(DB_NAME);
    
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
    const isLookup = searchParams.get('lookup') === 'true';
    const search = searchParams.get('search');
    const utilityType = searchParams.get('utility_type');
    const companyId = searchParams.get('companyId');
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const query: Record<string, unknown> = {
      userId: session.user.id
    };

    if (archivedParam === 'all') {
      // No extra filter
    } else if (archivedParam === 'true') {
      query.is_archived = true;
    } else {
      query.is_archived = { $ne: true };
    }

    if (search) {
      query.address = { $regex: search, $options: 'i' };
    }

    if (utilityType) {
      const types = utilityType.split(',');
      if (types.length > 0) query.utilities_managed = { $in: types };
    }

    if (companyId) {
      const companyIds = companyId.split(',');
      if (companyIds.length > 0) {
        // Find properties where any of their utility_companies match the selected IDs
        query.$or = companyIds.map(id => ({
          $jsonSchema: {
            properties: {
              utility_companies: {
                patternProperties: {
                  ".*": { enum: [id] }
                }
              }
            }
          }
        }));
        // Actually, MongoDB doesn't easily query values within a Record<string, string> using simple find.
        // Let's use a better approach for the company ID check.
        const orConditions = companyIds.map(id => {
            return {
                $expr: {
                    $gt: [
                        {
                            $size: {
                                $filter: {
                                    input: { $objectToArray: "$utility_companies" },
                                    as: "item",
                                    cond: { $eq: ["$$item.v", id] }
                                }
                            }
                        },
                        0
                    ]
                }
            };
        });
        query.$or = orConditions;
      }
    }

    // Optimization: If lookup mode, only fetch minimal fields
    const projection = isLookup ? { _id: 1, address: 1 } : {};

    const [properties, total] = await Promise.all([
      db.collection('properties')
        .find(query)
        .project(projection) // Apply projection
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
