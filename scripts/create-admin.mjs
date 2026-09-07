// Admin kullanıcı oluşturma scripti
// Kullanım: node scripts/create-admin.mjs

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_NAME = process.env.ADMIN_NAME;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!MONGODB_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error('MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL ve ADMIN_PASSWORD tanımlanmalıdır.');
}

if (ADMIN_PASSWORD.length < 12) {
  throw new Error('Yönetici parolası en az 12 karakter olmalıdır.');
}

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı');

    const usersCollection = mongoose.connection.collection('users');

    // Aynı e-posta ile kullanıcı var mı kontrol et
    const existing = await usersCollection.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      if (existing.role === 'admin') {
        console.log(`⚠️  "${ADMIN_EMAIL}" zaten admin olarak kayıtlı!`);
      } else {
        // Mevcut kullanıcıyı admin yap
        await usersCollection.updateOne(
          { email: ADMIN_EMAIL },
          { $set: { role: 'admin' } }
        );
        console.log(`✅ "${ADMIN_EMAIL}" admin rolüne yükseltildi!`);
      }
    } else {
      // Yeni admin oluştur
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

      await usersCollection.insertOne({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
        favorites: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('✅ Admin kullanıcı oluşturuldu!');
    }

    console.log('\n📋 Giriş Bilgileri:');
    console.log(`   E-posta: ${ADMIN_EMAIL}`);
    console.log(`   Şifre:   ${ADMIN_PASSWORD}`);
    console.log('\n🔗 Giriş yap: http://localhost:3000/login');
    console.log('🔗 Admin panel: http://localhost:3000/admin');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

createAdmin();
