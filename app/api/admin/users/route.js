import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/admin/users — Tüm kullanıcıları listele
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search');

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password')
        .lean(),
      User.countDocuments(filter),
    ]);

    return NextResponse.json({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Admin kullanıcı listeleme hatası:', error);
    return NextResponse.json({ error: 'Kullanıcılar yüklenemedi' }, { status: 500 });
  }
}

// PUT /api/admin/users — Kullanıcı rolü güncelle
export async function PUT(request) {
  try {
    await dbConnect();

    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json({ error: 'Kullanıcı ID ve rol gereklidir' }, { status: 400 });
    }

    if (!['user', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Geçersiz rol' }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password').lean();

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({
      message: `Kullanıcı rolü "${role}" olarak güncellendi`,
      user,
    });
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    return NextResponse.json({ error: 'Kullanıcı güncellenemedi' }, { status: 500 });
  }
}
