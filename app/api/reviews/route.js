import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';

// POST /api/reviews — Yeni yorum ekle
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yorum yapmak için giriş yapmalısınız' }, { status: 401 });
    }

    await dbConnect();

    const { productId, rating, comment } = await request.json();

    // Validasyon
    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: 'Ürün, puan ve yorum alanları zorunludur' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Puan 1-5 arasında olmalıdır' }, { status: 400 });
    }

    if (comment.trim().length < 10) {
      return NextResponse.json({ error: 'Yorum en az 10 karakter olmalıdır' }, { status: 400 });
    }

    // Ürünün var olup olmadığını kontrol et
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    // Aynı kullanıcının aynı ürüne tekrar yorum yapmasını engelle
    const existingReview = await Review.findOne({ user: session.user.id, product: productId });
    if (existingReview) {
      return NextResponse.json({ error: 'Bu ürün için zaten bir yorumunuz var' }, { status: 409 });
    }

    // Yorumu oluştur
    const review = await Review.create({
      user: session.user.id,
      product: productId,
      rating,
      comment: comment.trim(),
    });

    // Ürünün ortalama puanını güncelle
    const allReviews = await Review.find({ product: productId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: allReviews.length,
    });

    // Yeni review'u populate et
    const populatedReview = await Review.findById(review._id).populate('user', 'name').lean();

    return NextResponse.json({
      message: 'Yorumunuz başarıyla eklendi!',
      review: populatedReview,
    }, { status: 201 });

  } catch (error) {
    console.error('Yorum ekleme hatası:', error);

    if (error.code === 11000) {
      return NextResponse.json({ error: 'Bu ürün için zaten bir yorumunuz var' }, { status: 409 });
    }

    return NextResponse.json(
      { error: 'Yorum eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
