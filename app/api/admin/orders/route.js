import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

// GET /api/admin/orders — Tüm siparişleri listele
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status');

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email')
        .populate('items.product', 'name images')
        .lean(),
      Order.countDocuments(filter),
    ]);

    return NextResponse.json({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Admin sipariş listeleme hatası:', error);
    return NextResponse.json({ error: 'Siparişler yüklenemedi' }, { status: 500 });
  }
}

// PUT /api/admin/orders — Sipariş durumu güncelle
export async function PUT(request) {
  try {
    await dbConnect();

    const { orderId, status, trackingNumber } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Sipariş ID gereklidir' }, { status: 400 });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Geçersiz sipariş durumu' }, { status: 400 });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (status === 'delivered') updateData.paymentStatus = 'paid';
    if (status === 'cancelled') updateData.paymentStatus = 'cancelled';

    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    ).populate('user', 'name email').lean();

    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Sipariş güncellendi!',
      order,
    });
  } catch (error) {
    console.error('Sipariş güncelleme hatası:', error);
    return NextResponse.json({ error: 'Sipariş güncellenemedi' }, { status: 500 });
  }
}
