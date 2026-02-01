import { NextRequest, NextResponse } from 'next/server';
import clientPromise, { DB_NAME } from '@/lib/mongodb';
import { CompanySchema } from '@/lib/schemas';
import { ZodError } from 'zod';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = CompanySchema.parse(body);

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...companyData } = validatedData;
    
    const result = await db.collection('companies').insertOne({
      ...companyData,
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
    const serviceType = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const query: Record<string, unknown> = {
      userId: session.user.id // Filter by user ownership
    };
    if (serviceType) {
      query.service_type = serviceType;
    }

    const [companies, total] = await Promise.all([
      db.collection('companies')
        .find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('companies').countDocuments(query)
    ]);

    return NextResponse.json({
      data: companies,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("GET /api/companies error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
