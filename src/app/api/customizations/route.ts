import { NextResponse } from 'next/server';
import { CatalogService } from '@/server/services/catalog-service';

export async function GET() {
  try {
    const customizations = await CatalogService.getAllCustomizations();
    return NextResponse.json({ status: 'success', data: { customizations } });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
