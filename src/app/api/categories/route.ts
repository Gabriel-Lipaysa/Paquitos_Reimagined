import { NextResponse } from 'next/server';
import { CategoryRepository } from '@/server/repositories/category-repo';

export async function GET() {
  try {
    const categories = await CategoryRepository.getAll();
    const response = NextResponse.json({ status: 'success', data: { categories } });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
    return response;
  } catch (error: any) {
    console.error('Categories API error (Aiven cold-start / connection delay):', error?.message);
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

