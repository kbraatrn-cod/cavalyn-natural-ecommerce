import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ToastProvider } from "@/context/ToastContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Doğal Yaşam | Bitkisel Yağlar & Doğal Kozmetik",
  description:
    "Bitkisel yağlar ve doğal kozmetik ürünlerin güvenilir adresi. %100 doğal, organik ve el yapımı ürünlerle doğanın gücünü keşfedin.",
  keywords: "doğal kozmetik, bitkisel yağ, organik, cilt bakım, saç bakım, aromaterapi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <Navbar />
              <main>{children}</main>
              <Footer />
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
