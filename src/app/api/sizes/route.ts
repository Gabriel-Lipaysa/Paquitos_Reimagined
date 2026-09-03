import { NextResponse } from 'next/server';
import { CatalogService } from '@/server/services/catalog-service';

export async function GET() {
  try {
    const sizes = await CatalogService.getAllSizes();
    return NextResponse.json({ status: 'success', data: { sizes } });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
