import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { calculateNextBill } from '@/lib/billing';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const body = await req.json();

    const client = await clientPromise;
    const db = client.db('utilipay');
    const collection = db.collection('bills');
    const billId = new ObjectId(id);

    // Fetch original bill to check if it was a placeholder
    const originalBill = await collection.findOne({ _id: billId });

    if (!originalBill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    await collection.updateOne(
      { _id: billId },
      { $set: { ...body, updatedAt: new Date() } }
    );

    // Predictive Billing Trigger:
    // If the bill was a placeholder (amount 0) and is now being "filled in" (amount > 0),
    // generate the NEXT placeholder to keep the chain alive.
    if (originalBill.amount === 0 && body.amount > 0) {
      try {
        // Construct the full updated bill object for calculation
        // We use the body values (which are strings from JSON) and convert to Date where needed
        // or fall back to originalBill values.
        const updatedBillData = {
          property_id: body.property_id || originalBill.property_id,
          utility_type: body.utility_type || originalBill.utility_type,
          amount: body.amount,
          billing_period_start: new Date(body.billing_period_start || originalBill.billing_period_start),
          billing_period_end: new Date(body.billing_period_end || originalBill.billing_period_end),
          bill_date: new Date(body.bill_date || originalBill.bill_date),
          due_date: new Date(body.due_date || originalBill.due_date),
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nextDraft = calculateNextBill(updatedBillData as any);
        await collection.insertOne({ ...nextDraft, createdAt: new Date() });
      } catch (err) {
        console.error('Failed to generate next predictive bill:', err);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/bills/[id] error:', error);
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
    
    const result = await db.collection('bills').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/bills/[id] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
