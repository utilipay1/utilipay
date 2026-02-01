import { NextResponse } from 'next/server';
import { ensureIndexes } from '@/lib/db-indexes';
import { auth } from '@/auth';

export async function GET() {
  // Security: only allow if authenticated (or you can add a secret key)
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureIndexes();
    return NextResponse.json({ message: 'Indexes created successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
