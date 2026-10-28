import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromCookies } from '@/lib/jwt';
import { OrderService } from '@/server/services/order-service';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const orderId = parseInt(params.id, 10);
    let targetStatus: 'pending' | 'completed' = 'completed';

    try {
      const body = await req.json();
      if (body?.payment_status === 'pending' || body?.payment_status === 'completed') {
        targetStatus = body.payment_status;
      }
    } catch {
      // Default to completed if body is empty
    }

    const result = await OrderService.updatePaymentStatus(orderId, targetStatus);
    if (!result.success) {
      return NextResponse.json({ status: 'error', message: result.message }, { status: 400 });
    }

    return NextResponse.json({ status: 'success', message: result.message });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
