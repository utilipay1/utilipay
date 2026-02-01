import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export function validateObjectId(id: string) {
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
  }
  return null; // Return null if valid
}
