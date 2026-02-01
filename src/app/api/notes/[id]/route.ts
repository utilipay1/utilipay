import { NextRequest, NextResponse } from 'next/server';
import clientPromise, { DB_NAME } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { validateObjectId } from '@/lib/api-utils';
import { UserNoteSchema } from '@/lib/schemas';
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
    
    const validatedData = UserNoteSchema.partial().parse(body);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...updateData } = validatedData;

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const noteId = new ObjectId(id);

    // Verify ownership
    const note = await db.collection('user_notes').findOne({ _id: noteId });
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    if (note.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    await db.collection('user_notes').updateOne(
      { _id: noteId },
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/notes/[id] error:", error);
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

    const validationError = validateObjectId(id);
    if (validationError) return validationError;

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const noteId = new ObjectId(id);

    // Verify ownership
    const note = await db.collection('user_notes').findOne({ _id: noteId });
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    if (note.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.collection('user_notes').deleteOne({ _id: noteId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/notes/[id] error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
