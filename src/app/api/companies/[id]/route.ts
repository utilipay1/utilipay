import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { CompanySchema } from '@/lib/schemas';
import { auth } from '@/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    
    // Partial validation for updates
    const validatedData = CompanySchema.partial().parse(body);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...updateData } = validatedData;

    const client = await clientPromise;
    const db = client.db('utilipay');
    const companyId = new ObjectId(id);

    // Verify ownership
    const company = await db.collection('companies').findOne({ _id: companyId });
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    if (company.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const result = await db.collection('companies').updateOne(
      { _id: companyId },
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("PATCH /api/companies/[id] error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const client = await clientPromise;
    const db = client.db('utilipay');
    const companyId = new ObjectId(id);

    // Verify ownership
    const company = await db.collection('companies').findOne({ _id: companyId });
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    if (company.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.collection('companies').deleteOne({ _id: companyId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/companies/[id] error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
