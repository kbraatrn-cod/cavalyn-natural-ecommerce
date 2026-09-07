import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Review from '@/models/Review';

// GET /api/products/[id] — Tek ürün detayı (slug veya id ile)
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

    // Önce slug ile dene, bulamazsa id ile dene
    let product = await Product.findOne({ slug: id, isActive: true }).lean();

    if (!product) {
      // MongoDB ObjectId formatına uyuyorsa id ile ara
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findOne({ _id: id, isActive: true }).lean();
      }
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    // Ürün yorumlarını çek
    const reviews = await Review.find({ product: product._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name')
      .lean();

    // Benzer ürünler (aynı kategoriden, kendisi hariç)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .limit(4)
      .lean();

    return NextResponse.json({
      product,
      reviews,
      relatedProducts,
    });
  } catch (error) {
    console.error('Ürün detay hatası:', error);
    return NextResponse.json(
      { error: 'Ürün yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
