import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';

// POST /api/orders — Yeni sipariş oluştur
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 });
    }

    await dbConnect();

    const { items, shippingAddress } = await request.json();

    // Validasyon
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Sepetiniz boş' }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address ||
        !shippingAddress.city || !shippingAddress.phone) {
      return NextResponse.json({ error: 'Teslimat bilgilerini eksiksiz doldurun' }, { status: 400 });
    }

    // Ürünleri doğrula ve fiyatları sunucu tarafında hesapla
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Ürün bulunamadı: ${item.name}` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `"${product.name}" için yeterli stok yok (Mevcut: ${product.stock})` },
          { status: 400 }
        );
      }

      const price = product.discountPrice || product.price;
      const variantModifier = item.variant?.priceModifier || 0;
      const itemTotal = (price + variantModifier) * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: price + variantModifier,
        variant: item.variant ? { name: item.variant.name, value: item.variant.value } : undefined,
      });

      totalAmount += itemTotal;

      // Stok güncelle
      product.stock -= item.quantity;
      await product.save();
    }

    // Kargo ücreti
    const shippingCost = totalAmount >= 300 ? 0 : 29.90;
    totalAmount += shippingCost;

    // Sipariş oluştur
    const order = await Order.create({
      user: session.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress: {
        street: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state || '',
        zip: shippingAddress.zip || '',
      },
      status: 'pending',
      paymentMethod: 'kapida-odeme',
      paymentStatus: 'pending',
    });

    return NextResponse.json({
      message: 'Siparişiniz başarıyla oluşturuldu!',
      order: {
        id: order._id,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Sipariş hatası:', error);
    return NextResponse.json(
      { error: 'Sipariş oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// GET /api/orders — Kullanıcının siparişlerini listele
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 });
    }

    await dbConnect();

    const orders = await Order.find({ user: session.user.id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name images slug')
      .lean();

    return NextResponse.json({ orders });

  } catch (error) {
    console.error('Sipariş listeleme hatası:', error);
    return NextResponse.json(
      { error: 'Siparişler yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
