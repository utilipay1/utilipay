import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { calculateNextBill } from '@/lib/billing';
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

    const id = (await params).id;
    const body = await req.json();

    const client = await clientPromise;
    const db = client.db('utilipay');
    const collection = db.collection('bills');
    const billId = new ObjectId(id);

    // Fetch original bill to verify ownership
    const originalBill = await collection.findOne({ _id: billId });

    if (!originalBill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    if (originalBill.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await collection.updateOne(
      { _id: billId },
      { $set: { ...body, updatedAt: new Date() } }
    );

    // ... (Predictive Billing logic stays same, it will naturally use body/original values)
    // Actually, ensure next predictive bill also gets the userId injected
    if (originalBill.amount === 0 && body.amount > 0) {
      try {
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
        await collection.insertOne({ ...nextDraft, userId: session.user.id, createdAt: new Date() });
      } catch (err) {
        console.error('Failed to generate next predictive bill:', err);
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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = (await params).id;
    const client = await clientPromise;
    const db = client.db('utilipay');
    const billId = new ObjectId(id);

    // Verify ownership
    const bill = await db.collection('bills').findOne({ _id: billId });
    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }
    if (bill.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    await db.collection('bills').deleteOne({ _id: billId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/bills/[id] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
