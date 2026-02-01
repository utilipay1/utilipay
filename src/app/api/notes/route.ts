import { NextRequest, NextResponse } from 'next/server';
import clientPromise, { DB_NAME } from '@/lib/mongodb';
import { UserNoteSchema } from '@/lib/schemas';
import { ZodError } from 'zod';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = UserNoteSchema.parse(body);

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...noteData } = validatedData;
    
    const result = await db.collection('user_notes').insertOne({
      ...noteData,
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const notes = await db
      .collection('user_notes')
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(notes);
  } catch (error) {
    console.error("GET /api/notes error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
