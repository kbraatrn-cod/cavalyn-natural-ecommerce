import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

// GET /api/admin/products/[id] — Tek ürün detayı
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const product = await Product.findById(id).lean();
    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Ürün detay hatası:', error);
    return NextResponse.json({ error: 'Ürün yüklenemedi' }, { status: 500 });
  }
}

// PUT /api/admin/products/[id] — Ürün güncelle
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name: body.name,
        description: body.description,
        price: body.price,
        discountPrice: body.discountPrice || undefined,
        category: body.category,
        images: body.images || [],
        variants: body.variants || [],
        stock: body.stock || 0,
        tags: body.tags || [],
        featured: body.featured || false,
        isActive: body.isActive !== false,
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Ürün başarıyla güncellendi!',
      product,
    });
  } catch (error) {
    console.error('Ürün güncelleme hatası:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
    }

    return NextResponse.json({ error: 'Ürün güncellenemedi' }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] — Ürün sil (soft delete)
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Ürün başarıyla silindi (deaktif edildi)',
    });
  } catch (error) {
    console.error('Ürün silme hatası:', error);
    return NextResponse.json({ error: 'Ürün silinemedi' }, { status: 500 });
  }
}
