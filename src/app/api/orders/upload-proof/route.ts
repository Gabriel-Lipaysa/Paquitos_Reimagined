import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { getUserSessionFromCookies } from '@/lib/jwt';
import { saveUploadedFile } from '@/lib/storage';
import { OrderService } from '@/server/services/order-service';

export async function POST(req: NextRequest) {
  try {
    const session = getUserSessionFromCookies();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const orderIdRaw = formData.get('order_id') as string | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ status: 'error', message: 'No receipt image uploaded' }, { status: 400 });
    }

    // Verify MIME type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'image/bmp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid file format. Please upload an image file (JPG, PNG, or WEBP).' },
        { status: 400 }
      );
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { status: 'error', message: 'Image size exceeds maximum limit of 10MB.' },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name) || '.png';
    const cleanExt = ext.replace(/[^a-zA-Z0-9.]/g, '') || '.png';
    const orderPrefix = orderIdRaw ? `ord${parseInt(orderIdRaw, 10)}_` : '';
    const uniqueBase = `proof_${orderPrefix}${Date.now()}_${Math.random().toString(36).substring(2, 7)}${cleanExt}`;

    const savedUrl = await saveUploadedFile(file, 'payment_proofs', uniqueBase);

    // If order_id was provided, link proof directly to the existing order
    if (orderIdRaw) {
      const orderId = parseInt(orderIdRaw, 10);
      if (!isNaN(orderId) && orderId > 0) {
        const updateRes = await OrderService.updatePaymentProof(orderId, session.id, savedUrl);
        if (!updateRes.success) {
          return NextResponse.json({ status: 'error', message: updateRes.message }, { status: 400 });
        }
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'Payment proof receipt uploaded successfully',
      data: { url: savedUrl },
    });
  } catch (error: any) {
    console.error('Error uploading payment proof:', error);
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Failed to process receipt upload' },
      { status: 500 }
    );
  }
}
