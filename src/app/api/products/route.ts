import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/server/services/product-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const price = searchParams.get('price') || undefined;
    const category = searchParams.get('category') || undefined;

    const { products, categories } = await ProductService.getProducts(search, price, category, false);
    const response = NextResponse.json({ status: 'success', data: { products, categories } });
    // Edge cache: 30s maxage, 5 min background revalidate
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
    return response;
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
