import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

// GET /api/products — Ürün listeleme (filtreleme, arama, sayfalama, sıralama)
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);

    // Query parametreleri
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRating = searchParams.get('minRating');
    const featured = searchParams.get('featured');

    // Filtre oluştur
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    // Sıralama
    let sortOption = {};
    switch (sort) {
      case 'price-asc':
        sortOption = { price: 1 };
        break;
      case 'price-desc':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1 };
        break;
      case 'popular':
        sortOption = { reviewCount: -1 };
        break;
      case 'name-asc':
        sortOption = { name: 1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Ürün listeleme hatası:', error);
    return NextResponse.json(
      { error: 'Ürünler yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
