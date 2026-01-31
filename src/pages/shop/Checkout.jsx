import React, { useState, useEffect, useMemo } from 'react';
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

  // ✅ خصم فقط (لا زيادة)
  const [discount, setDiscount] = useState(0);

  const { products, totalPrice } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';
  const isPrivileged = isAdmin || isUser;

  const BASE_SHIPPING_FEE = 2;
  const shippingFee = isPrivileged ? 0 : BASE_SHIPPING_FEE;

  const subtotalWithShipping = useMemo(() => {
    return Number(totalPrice) + Number(shippingFee);
  }, [totalPrice, shippingFee]);

  // ✅ تنظيف/حماية الخصم: 0 .. subtotalWithShipping
  const safeDiscount = useMemo(() => {
    const n = Number(discount || 0);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Math.min(n, Math.max(0, subtotalWithShipping));
  }, [discount, subtotalWithShipping]);

  // ✅ الإجمالي بعد الخصم
  const finalTotal = useMemo(() => {
    const total = subtotalWithShipping - safeDiscount;
    return total > 0 ? total : 0;
  }, [subtotalWithShipping, safeDiscount]);

  useEffect(() => {
    if (isPrivileged) {
      setWilayat('محل');
    }
  }, [isPrivileged]);

  // ✅ إذا تغير الإجمالي الأساسي، تأكد ما يصير الخصم أكبر منه
  useEffect(() => {
    setDiscount((prev) => {
      const n = Number(prev || 0);
      if (!Number.isFinite(n) || n <= 0) return 0;
      return Math.min(n, Math.max(0, subtotalWithShipping));
    });
  }, [subtotalWithShipping]);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCustomerPhone(value);
  };

  const handleDiscountChange = (e) => {
    const raw = e.target.value;

    // يسمح بالفراغ أثناء الكتابة
    if (raw === '') {
      setDiscount('');
      return;
    }

    const n = Number(raw);

    // إذا دخل شيء غير رقم تجاهله
    if (!Number.isFinite(n)) return;

    // منع السالب (لا زيادة سعر)
    if (n < 0) {
      setDiscount(0);
      return;
    }

    // منع خصم أكبر من الإجمالي قبل الخصم
    setDiscount(Math.min(n, Math.max(0, subtotalWithShipping)));
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
              measurements: product.tailoring?.measurements || null,
            },
          }),
        })),
        customerName,
        customerPhone,
        wilayat,
        email: user?.email || 'no-email-provided@example.com',
        notes,
        amount: Number(finalTotal), // ✅ المبلغ بعد الخصم
        shippingFee,
        discount: Number(safeDiscount), // ✅ حفظ الخصم (اختياري للباك-إند)
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
          discount: orderData.discount,
        },
      });
    } catch (err) {
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

                  {/* ✅ إظهار قياسات الأقمشة إذا كان تفصيل */}
                  {product.tailoring?.mode === 'detail' && product.tailoring?.measurements && (
                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md p-2">
                      <div className="font-semibold text-gray-700 mb-1">قياسات التفصيل:</div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                        <div>الطول: <span className="font-medium">{product.tailoring.measurements.length}</span></div>
                        <div>العرض الأعلى: <span className="font-medium">{product.tailoring.measurements.upperWidth}</span></div>

                        <div>العرض الأسفل من الأعلى: <span className="font-medium">{product.tailoring.measurements.lowerWidthFromTop}</span></div>
                        <div>الرقبة: <span className="font-medium">{product.tailoring.measurements.neck}</span></div>

                        <div>طول الردون: <span className="font-medium">{product.tailoring.measurements.sleeveLength}</span></div>
                        <div>عرض الردون: <span className="font-medium">{product.tailoring.measurements.sleeveWidth}</span></div>

                        <div>العرض السفلي الأخير: <span className="font-medium">{product.tailoring.measurements.lastBottomWidth}</span></div>
                        <div>الكتف: <span className="font-medium">{product.tailoring.measurements.shoulder}</span></div>
                      </div>

                      {Number(product.tailoring?.fee || 0) > 0 && (
                        <div className="mt-2 text-gray-700">
                          رسوم التفصيل: <span className="font-semibold">{Number(product.tailoring.fee).toFixed(2)}</span> ر.ع
                        </div>
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

          {/* ✅ خصم فقط */}
          {isPrivileged && (
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-gray-800">خصم</span>
              <input
                type="number"
                className="w-24 p-1 border rounded-md text-right"
                value={discount}
                onChange={handleDiscountChange}
                placeholder="0"
                min="0"
                max={subtotalWithShipping}
              />
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-gray-800 font-semibold">الإجمالي</span>
            <p className="text-gray-900 font-bold">
              {finalTotal.toFixed(2)} ر.ع
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
