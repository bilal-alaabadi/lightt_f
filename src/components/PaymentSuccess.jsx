import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../redux/features/cart/cartSlice';

const PaymentSuccess = () => {
  const { state } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    dispatch(clearCart());

    const successTimer = setTimeout(() => {
      setShowSuccess(true);

      const redirectTimer = setTimeout(() => {
        navigate('/');
      }, 5000);

      return () => clearTimeout(redirectTimer);
    }, 500);

    return () => clearTimeout(successTimer);
  }, [dispatch, navigate]);

  if (!state) {
    return <div className="text-red-500 p-4">لا توجد بيانات طلب</div>;
  }

  const {
    order,
    products = [],
    customerName,
    customerPhone,
    wilayat,
    totalAmount,
  } = state;

  return (
    <>
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              تم الطلب بنجاح!
            </h2>
            <p className="text-gray-700 mb-2">
              سيتم تحويلك إلى الصفحة الرئيسية خلال لحظات...
            </p>
            <p className="text-gray-700">
              سوف يتم التواصل معك واتساب في أقرب وقت لتأكيد طلبك.
            </p>
          </div>
        </div>
      )}

      <section className="section__container rounded p-6">
        {/* تفاصيل المنتجات */}
        <div className="mt-8 pt-6" dir="rtl">
          <h3 className="text-xl font-bold mb-4">تفاصيل المنتجات</h3>

          <div className="space-y-6">
            {products.map((product, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg"
              >
                <div className="md:w-1/4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-auto rounded-md"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150';
                      e.target.alt = 'صورة غير متوفرة';
                    }}
                  />
                </div>

                <div className="md:w-3/4">
                  <h4 className="text-lg font-semibold">{product.name}</h4>

                  <div className="mt-2">
                    <span className="font-medium">الكمية: </span>
                    <span>{product.quantity}</span>
                  </div>

                  {product.selectedSize && (
                    <div className="mt-2">
                      <span className="font-medium">الحجم: </span>
                      <span>{product.selectedSize}</span>
                    </div>
                  )}

                  <div className="mt-2">
                    <span className="font-medium">السعر: </span>
                    <span>
                      {(Number(product.price) * Number(product.quantity)).toFixed(2)} ر.ع
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ملخص الطلب */}
        <div className="mt-8 border-t pt-6" dir="rtl">
          <h3 className="text-xl font-bold mb-4">ملخص الطلب</h3>

          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between py-2">
              <span>الإجمالي النهائي:</span>
              <span className="font-bold">
                {Number(totalAmount).toFixed(2)} ر.ع
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span>اسم العميل:</span>
              <span className="font-semibold">{customerName || '-'}</span>
            </div>

            <div className="flex justify-between py-2">
              <span>رقم الهاتف:</span>
              <span className="font-semibold">{customerPhone || '-'}</span>
            </div>

            <div className="flex justify-between py-2">
              <span>الولاية:</span>
              <span className="font-semibold">{wilayat || '-'}</span>
            </div>

            <div className="flex justify-between py-2 border-t pt-3">
              <span>رقم الطلب:</span>
              <span className="font-semibold">
                {order?.orderId || '--'}
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PaymentSuccess;
