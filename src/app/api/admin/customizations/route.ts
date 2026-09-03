import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromCookies } from '@/lib/jwt';
import { CatalogService } from '@/server/services/catalog-service';
import { validateCustomizationInput } from '@/validation/product-schema';
import { saveUploadedFile } from '@/lib/storage';

export async function GET() {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const customizations = await CatalogService.getAllCustomizations();
    return NextResponse.json({ status: 'success', data: { customizations } });
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

    const formData = await req.formData();
    const cusName = formData.get('cusName');
    const cusPrice = formData.get('cusPrice');
    const imageFile = formData.get('cusImage') as File | null;

    const validation = validateCustomizationInput({ cusName, cusPrice });
    if (!validation.valid || !validation.data) {
      return NextResponse.json({ status: 'error', message: validation.error }, { status: 400 });
    }

    let imageFilename: string | undefined = undefined;
    if (imageFile && imageFile.size > 0) {
      const saved = await saveUploadedFile(imageFile, 'uploads/customization', validation.data.cusName);
      imageFilename = `uploads/customization/${saved}`;
    }

    const result = await CatalogService.createCustomization({
      ...validation.data,
      cusImage: imageFilename,
    });

    return NextResponse.json({ status: 'success', message: result.message, data: { cusID: result.cusID } });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
