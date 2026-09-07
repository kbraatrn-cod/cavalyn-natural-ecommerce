import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';

// GET /api/admin/dashboard — Dashboard istatistikleri
export async function GET() {
  try {
    await dbConnect();

    const [totalOrders, totalUsers, totalProducts, orders, lowStockProducts] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'name email')
        .lean(),
      Product.find({ stock: { $lte: 5 }, isActive: true })
        .sort({ stock: 1 })
        .limit(10)
        .select('name category stock')
        .lean(),
    ]);

    // Toplam gelir hesapla
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    return NextResponse.json({
      stats: {
        totalOrders,
        totalUsers,
        totalProducts,
        totalRevenue,
      },
      recentOrders: orders,
      lowStockProducts,
    });
  } catch (error) {
    console.error('Dashboard hatası:', error);
    return NextResponse.json(
      { error: 'Dashboard verileri yüklenemedi' },
      { status: 500 }
    );
  }
}
