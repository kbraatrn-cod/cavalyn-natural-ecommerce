import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';

// GET /api/favorites — Favori listesini getir
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id)
      .populate({
        path: 'favorites',
        match: { isActive: true },
        select: 'name slug price discountPrice images category rating reviewCount stock',
      })
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ favorites: user.favorites || [] });

  } catch (error) {
    console.error('Favori listeleme hatası:', error);
    return NextResponse.json(
      { error: 'Favoriler yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST /api/favorites — Favorilere ürün ekle
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 });
    }

    await dbConnect();

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Ürün ID gereklidir' }, { status: 400 });
    }

    // Ürünün var olduğunu kontrol et
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    const user = await User.findById(session.user.id);

    // Zaten favorilerde mi?
    if (user.favorites.includes(productId)) {
      return NextResponse.json({ error: 'Bu ürün zaten favorilerinizde' }, { status: 409 });
    }

    user.favorites.push(productId);
    await user.save();

    return NextResponse.json({
      message: 'Ürün favorilere eklendi!',
      favorites: user.favorites,
    }, { status: 201 });

  } catch (error) {
    console.error('Favori ekleme hatası:', error);
    return NextResponse.json(
      { error: 'Favorilere eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites — Favorilerden ürün çıkar
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 });
    }

    await dbConnect();

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Ürün ID gereklidir' }, { status: 400 });
    }

    const user = await User.findById(session.user.id);

    user.favorites = user.favorites.filter(
      fav => fav.toString() !== productId
    );
    await user.save();

    return NextResponse.json({
      message: 'Ürün favorilerden çıkarıldı',
      favorites: user.favorites,
    });

  } catch (error) {
    console.error('Favori silme hatası:', error);
    return NextResponse.json(
      { error: 'Favorilerden çıkarılırken bir hata oluştu' },
      { status: 500 }
    );
  }
}
