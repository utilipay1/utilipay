import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const client = await clientPromise;
    const db = client.db('utilipay');
    const result = await db.collection('properties').updateOne(
      { _id: new ObjectId(id) },
      { $set: body }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Cascading Archive: If property is archived, archive its bills
    if (body.is_archived === true) {
      await db.collection('bills').updateMany(
        { property_id: id },
        { $set: { is_archived: true } }
      );
    }

    return NextResponse.json(result);
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
    const id = (await params).id;
    const client = await clientPromise;
    const db = client.db('utilipay');

    // 1. Delete the property
    const result = await db.collection('properties').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // 2. Cascade delete all associated bills
    await db.collection('bills').deleteMany({ property_id: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/properties/[id] error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
