import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromCookies } from '@/lib/jwt';
import { CatalogService } from '@/server/services/catalog-service';
import { validateSizeInput } from '@/validation/product-schema';

export async function GET() {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const sizes = await CatalogService.getAllSizes();
    return NextResponse.json({ status: 'success', data: { sizes } });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const validation = validateSizeInput(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json({ status: 'error', message: validation.error }, { status: 400 });
    }

    const { sizename, sizeprice } = validation.data;
    const result = await CatalogService.createSize(sizename, sizeprice);

    return NextResponse.json({ status: 'success', message: result.message, data: { sizeID: result.sizeID } });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
