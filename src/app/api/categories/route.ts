import { NextResponse } from 'next/server';
import { CategoryRepository } from '@/server/repositories/category-repo';

export async function GET() {
  try {
    const categories = await CategoryRepository.getAll();
    const response = NextResponse.json({ status: 'success', data: { categories } });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
    return response;
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}

