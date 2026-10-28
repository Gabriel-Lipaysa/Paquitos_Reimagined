import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/server/services/product-service';

export const dynamic = 'force-dynamic';

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
    console.error('Products API error (Aiven cold-start / connection delay):', error?.message);
    return NextResponse.json(
      {
        status: 'error',
        code: 'COLD_START_OR_DOWN',
        message: 'Database connection delay or cold start. The service is waking up.',
        error: error?.message || 'Server error',
      },
      { status: 503 }
    );
  }
}
