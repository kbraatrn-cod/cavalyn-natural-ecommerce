import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    await dbConnect();

    const { name, email, password } = await request.json();

    // Validasyon
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Tüm alanları doldurun' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    // E-posta kontrolü
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 409 }
      );
    }

    // Kullanıcı oluştur
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    return NextResponse.json(
      {
        message: 'Hesabınız başarıyla oluşturuldu',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Kayıt hatası:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu, lütfen tekrar deneyin' },
      { status: 500 }
    );
  }
}
