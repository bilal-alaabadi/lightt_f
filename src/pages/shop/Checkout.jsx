import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getBaseUrl } from '../../utils/baseURL';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../../redux/features/cart/cartSlice';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [wilayat, setWilayat] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { products, totalPrice } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';
  const isPrivileged = isAdmin || isUser;

  const BASE_SHIPPING_FEE = 2;
  const shippingFee = isPrivileged ? 0 : BASE_SHIPPING_FEE;

  useEffect(() => {
    if (isPrivileged) {
      setWilayat('محل');
    }
  }, [isPrivileged]);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCustomerPhone(value);
  };

  const createOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (products.length === 0) {
        throw new Error('لا توجد منتجات في السلة');
      }

      if (!isPrivileged) {
        if (!customerName || !customerPhone || !wilayat) {
          throw new Error('الرجاء إدخال جميع المعلومات المطلوبة');
        }
      } else {
        if (!wilayat) throw new Error('حقل الولاية مطلوب');
      }

      const orderData = {
        products: products.map((product) => ({
          productId: product._id,
          name: product.name,
          image: Array.isArray(product.image) ? product.image[0] : product.image,
          price: Number(product.price),
          originalPrice: Number(product.oldPrice || product.originalPrice || 0),
          quantity: Number(product.quantity),
          ...(product.selectedSize && { selectedSize: product.selectedSize }),
          ...(product.selectedColor && { selectedColor: product.selectedColor }),
          ...(product.tailoring && {
            tailoring: {
              mode: product.tailoring?.mode || 'without',
              fee: Number(product.tailoring?.fee || 0),
              measurements: product.tailoring?.measurements
                ? {
                    length: Number(product.tailoring.measurements.length || 0),
                    upperWidth: Number(product.tailoring.measurements.upperWidth || 0),
                    lowerWidthFromTop: Number(product.tailoring.measurements.lowerWidthFromTop || 0),
                    neck: Number(product.tailoring.measurements.neck || 0),
                    sleeveLength: Number(product.tailoring.measurements.sleeveLength || 0),
                    sleeveWidth: Number(product.tailoring.measurements.sleeveWidth || 0),
                    lastBottomWidth: Number(product.tailoring.measurements.lastBottomWidth || 0),
                    shoulder: Number(product.tailoring.measurements.shoulder || 0),
                  }
                : null,
            },
          }),
        })),
        customerName,
        customerPhone,
        wilayat,
        email: user?.email || 'no-email-provided@example.com',
        notes,
        amount: Number(totalPrice) + Number(shippingFee),
        shippingFee,
        isAdmin: isPrivileged,
      };

      const response = await fetch(`${getBaseUrl()}/api/orders/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل إنشاء الطلب');
      }

      const data = await response.json();
      dispatch(clearCart());
      navigate('/success', {
        state: {
          order: data.order,
          products: orderData.products,
          customerName,
          customerPhone,
          wilayat,
          totalAmount: orderData.amount,
        },
      });
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto flex flex-col md:flex-row gap-8" dir="rtl">
      <div className="flex-1">
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">تفاصيل الطلب</h1>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={createOrder} className="space-y-4 md:space-y-6">
          <div className="space-y-4">
            {!isPrivileged ? (
              <>
                <div>
                  <label className="block text-gray-700 mb-2">الاسم الكامل *</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">رقم الهاتف *</label>
                  <input
                    type="tel"
                    className="w-full p-2 border rounded-md"
                    value={customerPhone}
                    onChange={handlePhoneChange}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    minLength="8"
                    maxLength="15"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-gray-700 mb-2">الاسم الكامل (اختياري)</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">رقم الهاتف (اختياري)</label>
                  <input
                    type="tel"
                    className="w-full p-2 border rounded-md"
                    value={customerPhone}
                    onChange={handlePhoneChange}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    minLength="8"
                    maxLength="15"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-gray-700 mb-2">{isPrivileged ? 'المكان *' : 'الولاية *'}</label>
              {isPrivileged ? (
                <input
                  type="text"
                  className="w-full p-2 border rounded-md bg-gray-100"
                  value={wilayat}
                  readOnly
                />
              ) : (
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={wilayat}
                  onChange={(e) => setWilayat(e.target.value)}
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-2">ملاحظات (اختياري)</label>
              <textarea
                className="w-full p-2 border rounded-md"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#d8bb96] text-white px-6 py-3 rounded-md w-full"
            disabled={isSubmitting || products.length === 0}
          >
            {isSubmitting ? 'جارٍ تأكيد الطلب...' : 'تأكيد الطلب'}
          </button>
        </form>
      </div>

      <div className="w-full md:w-1/3 p-4 md:p-6 bg-white rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-800">ملخص الطلب</h2>

        <div className="space-y-4">
          {products.map((product) => (
            <div key={product._id} className="py-3 border-b border-gray-100">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <span className="text-gray-700">
                    {product.name} × {product.quantity}
                  </span>

                  {product.selectedSize && (
                    <p className="text-sm text-gray-500 mt-1">الحجم: {product.selectedSize}</p>
                  )}

                  {product.selectedColor && (
                    <p className="text-sm text-gray-500 mt-1">اللون: {product.selectedColor}</p>
                  )}

                  {product.tailoring?.mode && (
                    <div className="mt-2 bg-amber-50 border border-amber-200 rounded-md p-2">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">التفصيل:</span>{' '}
                        {product.tailoring.mode === 'detail' ? 'تفصيل' : 'بدون تفصيل'}
                      </p>

                      {product.tailoring.mode === 'detail' && (
                        <>
                          <p className="text-sm text-gray-700 mt-1">
                            <span className="font-semibold">رسوم التفصيل:</span>{' '}
                            {Number(product.tailoring.fee || 0).toFixed(2)} ر.ع
                          </p>

                          {product.tailoring.measurements && (
                            <div className="mt-2 text-sm text-gray-700 space-y-1">
                              <p>
                                <span className="font-semibold">الطول:</span> {product.tailoring.measurements.length}
                              </p>
                              <p>
                                <span className="font-semibold">العرض الأعلى:</span> {product.tailoring.measurements.upperWidth}
                              </p>
                              <p>
                                <span className="font-semibold">العرض الأسفل من الأعلى:</span>{' '}
                                {product.tailoring.measurements.lowerWidthFromTop}
                              </p>
                              <p>
                                <span className="font-semibold">قياس الرقبة:</span> {product.tailoring.measurements.neck}
                              </p>
                              <p>
                                <span className="font-semibold">طول الردون:</span> {product.tailoring.measurements.sleeveLength}
                              </p>
                              <p>
                                <span className="font-semibold">عرض الردون:</span> {product.tailoring.measurements.sleeveWidth}
                              </p>
                              <p>
                                <span className="font-semibold">قياس العرض السفلي الأخير:</span>{' '}
                                {product.tailoring.measurements.lastBottomWidth}
                              </p>
                              <p>
                                <span className="font-semibold">قياس الكتف:</span> {product.tailoring.measurements.shoulder}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                <span className="text-gray-900 font-medium whitespace-nowrap">
                  {(Number(product.price) * Number(product.quantity)).toFixed(2)} ر.ع.
                </span>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-gray-800">رسوم الشحن</span>
            <p className="text-gray-900">{Number(shippingFee).toFixed(2)} ر.ع</p>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-gray-800 font-semibold">الإجمالي</span>
            <p className="text-gray-900 font-bold">
              {(Number(totalPrice) + Number(shippingFee)).toFixed(2)} ر.ع
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
