import React, { useState } from 'react';
import Banner from './Banner';
import TrendingProducts from '../shop/TrendingProducts';
import HeroSection from './HeroSection';
import { FaWhatsapp } from 'react-icons/fa';
import log from '../../assets/Asset_8__1_-removebg-preview.png'; // شعار الأنثور

const Home = () => {
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // رقم الهاتف أو رابط الدردشة على الواتساب
  const whatsappNumber = '96894300313';
  const whatsappMessage = 'مرحباً، أريد الاستفسار عن المنتجات';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <>
      {/* شاشة البداية: الشعار كبير مع لمعة تتحرك من الأعلى للأسفل */}
      {isLoadingProducts && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
          <div className="logo-wrapper">
            <img
              src={log}
              alt="شعار الأنثور"
              className="h-[280px] md:h-[360px] w-auto select-none"
              draggable="false"
            />
          </div>

          {/* CSS للحركة (مضمّن داخل نفس الملف) */}
          <style>{`
            .logo-wrapper {
              position: relative;
              display: inline-block;
              overflow: hidden; /* لإخفاء اللمعة خارج حدود الشعار */
              filter: drop-shadow(0 8px 24px rgba(0,0,0,0.08));
            }
            /* طبقة اللمعة */
            .logo-wrapper::before {
              content: '';
              position: absolute;
              top: -160%;
              left: 0;
              width: 100%;
              height: 320%;
              background: linear-gradient(
                to bottom,
                rgba(255,255,255,0) 0%,
                rgba(255,255,255,0.6) 50%,
                rgba(255,255,255,0) 100%
              );
              animation: shineMove 2.5s linear infinite;
              pointer-events: none;
            }
            @keyframes shineMove {
              0%   { top: -160%; }
              100% { top: 160%;  }
            }
          `}</style>
        </div>
      )}

      <Banner />
      <HeroSection />
      <TrendingProducts onProductsLoaded={() => setIsLoadingProducts(false)} />

      {/* زر الواتساب العائم - على اليمين */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-all duration-300"
          style={{ width: '60px', height: '60px' }}
        >
          <FaWhatsapp size={30} />
        </a>
      </div>
    </>
  );
};

export default Home;
