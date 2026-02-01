import { NextRequest, NextResponse } from 'next/server';
import clientPromise, { DB_NAME } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { validateObjectId } from '@/lib/api-utils';
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

    const validationError = validateObjectId(id);
    if (validationError) return validationError;

    const body = await req.json();

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // Verify ownership
    const propertyId = new ObjectId(id);
    const property = await db.collection('properties').findOne({ _id: propertyId });
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    if (property.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.collection('properties').updateOne(
      { _id: propertyId },
      { $set: body }
    );

    // Cascading Archive: If property is archived, archive its bills
    if (body.is_archived === true) {
      await db.collection('bills').updateMany(
        { property_id: id, userId: session.user.id }, // Security: ensure userId match
        { $set: { is_archived: true } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/properties/[id] error:", error);
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

    const id = (await params).id;

    const validationError = validateObjectId(id);
    if (validationError) return validationError;

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const propertyId = new ObjectId(id);

    // Verify ownership
    const property = await db.collection('properties').findOne({ _id: propertyId });
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    if (property.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. Delete the property
    await db.collection('properties').deleteOne({ _id: propertyId });

    // 2. Cascade delete all associated bills
    await db.collection('bills').deleteMany({ property_id: id, userId: session.user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/properties/[id] error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
