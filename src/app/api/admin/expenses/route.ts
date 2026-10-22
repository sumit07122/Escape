import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin, createAuditLog } from '@/lib/server-utils';



export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const expenses = await db.expense.findMany({
      orderBy: { date: 'desc' },
    });

    const categoryTotals = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json({ expenses, categoryTotals, totalExpense });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { category, title, amount, vendor, receiptRef, description } = body;

    if (!category || !title || !amount) {
      return NextResponse.json({ error: 'Category, title and amount are required' }, { status: 400 });
    }

    const trip = await db.trip.findFirst();

    const expense = await db.expense.create({
      data: {
        tripId: trip!.id,
        category,
        title,
        amount: Number(amount),
        vendor,
        receiptRef,
        description,
        recordedBy: admin.name || admin.email,
      },
    });

    await createAuditLog({
      action: 'ADMIN_EXPENSE_RECORDED',
      entityType: 'EXPENSE',
      entityId: expense.id,
      performedBy: `Admin: ${admin.name}`,
      newValue: `₹${amount} - ${category}: ${title}`,
    });

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error('Error recording expense:', error);
    return NextResponse.json({ error: 'Failed to record expense' }, { status: 500 });
  }
}
