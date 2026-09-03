import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromCookies } from '@/lib/jwt';
import { CatalogService } from '@/server/services/catalog-service';
import { validateCustomizationInput } from '@/validation/product-schema';
import { saveUploadedFile } from '@/lib/storage';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const id = parseInt(params.id, 10);
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

    const result = await CatalogService.updateCustomization(id, {
      ...validation.data,
      cusImage: imageFilename,
    });

    if (!result.success) {
      return NextResponse.json({ status: 'error', message: result.message }, { status: 404 });
    }

    return NextResponse.json({ status: 'success', message: result.message });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const id = parseInt(params.id, 10);
    const result = await CatalogService.deleteCustomization(id);
    if (!result.success) {
      return NextResponse.json({ status: 'error', message: result.message }, { status: 404 });
    }

    return NextResponse.json({ status: 'success', message: result.message });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
