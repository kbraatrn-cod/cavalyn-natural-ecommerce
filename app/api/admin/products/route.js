import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

// GET /api/admin/products — Tüm ürünleri listele (admin)
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Admin ürün listeleme hatası:', error);
    return NextResponse.json({ error: 'Ürünler yüklenemedi' }, { status: 500 });
  }
}

// POST /api/admin/products — Yeni ürün oluştur
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();

    const product = await Product.create({
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
    });

    return NextResponse.json({
      message: 'Ürün başarıyla oluşturuldu!',
      product,
    }, { status: 201 });
  } catch (error) {
    console.error('Ürün oluşturma hatası:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
    }

    return NextResponse.json({ error: 'Ürün oluşturulamadı' }, { status: 500 });
  }
}
