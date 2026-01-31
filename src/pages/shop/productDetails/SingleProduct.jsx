// SingleProduct.jsx
import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFetchProductByIdQuery } from '../../../redux/features/products/productsApi';
import { addToCart } from '../../../redux/features/cart/cartSlice';
import ReviewsCard from '../reviews/ReviewsCard';

const calculateDiscountPercentage = (currentPrice, oldPrice) => {
  const discount = ((oldPrice - currentPrice) / oldPrice) * 100;
  return Math.round(discount);
};

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const normalizeArabic = (s) =>
  String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/[ًٌٍَُِّْ]/g, '')
    .replace(/أ|إ|آ/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');

const SingleProduct = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { data, error, isLoading } = useFetchProductByIdQuery(id);

  const user = useSelector((state) => state?.auth?.user);
  const isUser = user?.role === 'user';

  const { products: cartItems } = useSelector((state) => state.cart);

  const singleProduct = data?.product || {};
  const productReviews = data?.reviews || [];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isFabricProduct = singleProduct?.category === 'أقمشة';

  const isShoeProduct = useMemo(() => {
    const cat = normalizeArabic(singleProduct?.category);
    const name = normalizeArabic(singleProduct?.name);
    return cat.includes('احذ') || name.includes('حذاء') || name.includes('احذ');
  }, [singleProduct?.category, singleProduct?.name]);

  const [tailoringMode, setTailoringMode] = useState('without'); // 'detail' | 'without'

  const [measurements, setMeasurements] = useState({
    length: '',
    upperWidth: '',
    lowerWidthFromTop: '',
    neck: '',
    sleeveLength: '',
    sleeveWidth: '',
    lastBottomWidth: '',
    shoulder: '',
  });

  const tailoringFee = 3.5;

  const basePrice = useMemo(() => toNumber(singleProduct?.price), [singleProduct?.price]);
  const baseOldPrice = useMemo(() => toNumber(singleProduct?.oldPrice), [singleProduct?.oldPrice]);

  const finalPrice = useMemo(() => {
    if (isFabricProduct && isUser && tailoringMode === 'detail') return +(basePrice + tailoringFee).toFixed(3);
    return +basePrice.toFixed(3);
  }, [basePrice, isFabricProduct, isUser, tailoringMode]);

  const finalOldPrice = useMemo(() => {
    return baseOldPrice > 0 ? +baseOldPrice.toFixed(3) : 0;
  }, [baseOldPrice]);

  const discountPercent = useMemo(() => {
    if (!finalOldPrice || finalOldPrice <= 0) return null;
    if (finalOldPrice <= finalPrice) return null;
    return calculateDiscountPercentage(finalPrice, finalOldPrice);
  }, [finalPrice, finalOldPrice]);

  const [selectedQty, setSelectedQty] = useState(1);

  const currentCartItem = useMemo(
    () => cartItems.find((item) => item._id === singleProduct?._id),
    [cartItems, singleProduct?._id]
  );

  const maxAddableQty = useMemo(() => {
    const available = Number(singleProduct?.quantity || 0);
    const inCartSameProduct = Number(currentCartItem?.quantity || 0);
    const remain = available - inCartSameProduct;
    return remain > 0 ? remain : 0;
  }, [singleProduct?.quantity, currentCartItem?.quantity]);

  const safeSelectedQty = useMemo(() => {
    const q = Number(selectedQty || 1);
    if (!Number.isFinite(q) || q <= 0) return 1;
    if (maxAddableQty > 0) return Math.min(Math.floor(q), maxAddableQty);
    return 1;
  }, [selectedQty, maxAddableQty]);

  // ✅ إلغاء خصم الغتر: السعر الإجمالي = السعر النهائي × الكمية (بدون أي خصم bulk)
  const displayedTotalPrice = useMemo(() => {
    const total = finalPrice * safeSelectedQty;
    return +total.toFixed(3);
  }, [finalPrice, safeSelectedQty]);

  const displayedTotalOldPrice = useMemo(() => {
    if (!finalOldPrice || finalOldPrice <= 0) return 0;
    return +(finalOldPrice * safeSelectedQty).toFixed(3);
  }, [finalOldPrice, safeSelectedQty]);

  const nextImage = () => {
    if (!singleProduct?.image?.length) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === singleProduct.image.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    if (!singleProduct?.image?.length) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? singleProduct.image.length - 1 : prevIndex - 1
    );
  };

  const handleChangeMeasurement = (key, value) => {
    setMeasurements((prev) => ({ ...prev, [key]: value }));
  };

  const validateMeasurements = () => {
    const requiredKeys = Object.keys(measurements);
    for (const k of requiredKeys) {
      const v = String(measurements[k] ?? '').trim();
      if (!v) return { ok: false, msg: 'رجاءً قم بتعبئة جميع قياسات التفصيل قبل الإضافة للسلة.' };
      const n = Number(v);
      if (!Number.isFinite(n) || n <= 0) return { ok: false, msg: 'رجاءً أدخل قياسات صحيحة (أرقام أكبر من صفر).' };
    }
    return { ok: true };
  };

  const handleAddToCart = (product) => {
    if (product.quantity <= 0) {
      alert('نفذت الكمية من هذا المنتج');
      return;
    }

    if (maxAddableQty <= 0) {
      alert('لقد وصلت إلى الحد الأقصى للكمية المتاحة لهذا المنتج');
      return;
    }

    if (safeSelectedQty > maxAddableQty) {
      alert('الكمية المتوفرة لا تكفي للعدد المطلوب');
      return;
    }

    if (isFabricProduct && isUser && tailoringMode === 'detail') {
      const v = validateMeasurements();
      if (!v.ok) {
        alert(v.msg);
        return;
      }
    }

    const cartPayload = {
      ...product,
      price: finalPrice,
      tailoring: isFabricProduct && isUser
        ? {
            mode: tailoringMode,
            fee: tailoringMode === 'detail' ? tailoringFee : 0,
            measurements: tailoringMode === 'detail'
              ? {
                  length: Number(measurements.length),
                  upperWidth: Number(measurements.upperWidth),
                  lowerWidthFromTop: Number(measurements.lowerWidthFromTop),
                  neck: Number(measurements.neck),
                  sleeveLength: Number(measurements.sleeveLength),
                  sleeveWidth: Number(measurements.sleeveWidth),
                  lastBottomWidth: Number(measurements.lastBottomWidth),
                  shoulder: Number(measurements.shoulder),
                }
              : null,
          }
        : null,
    };

    for (let i = 0; i < safeSelectedQty; i++) {
      dispatch(addToCart(cartPayload));
    }

    setSelectedQty(1);
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );

  if (error)
    return (
      <div className="section__container text-center py-20">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md mx-auto">
          <strong className="font-bold">خطأ!</strong>
          <span className="block sm:inline"> حدث خطأ أثناء تحميل تفاصيل المنتج.</span>
        </div>
      </div>
    );

  return (
    <>
      <section className="bg-[#FAEBD7] py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-4">تفاصيل المنتج</h2>
          <div className="flex justify-center items-center text-sm md:text-base">
            <span className="hover:text-primary transition-colors">
              <Link to="/">الرئيسية</Link>
            </span>
            <i className="ri-arrow-left-s-line mx-2"></i>
            <span className="hover:text-primary transition-colors">
              <Link to="/shop">المتجر</Link>
            </span>
            <i className="ri-arrow-left-s-line mx-2"></i>
            <span className="text-primary">{singleProduct.name}</span>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
            <div className="lg:w-1/2 w-full">
              <div className="relative bg-white rounded-lg shadow-md overflow-hidden p-4">
                {singleProduct.image && singleProduct.image.length > 0 ? (
                  <>
                    <div className="relative aspect-square w-full">
                      <img
                        src={singleProduct.image[currentImageIndex]}
                        alt={singleProduct.name}
                        className="w-full h-full object-contain rounded-md"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/500';
                          e.target.alt = 'Image not found';
                        }}
                      />
                    </div>

                    {singleProduct.image.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white text-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                        >
                          <i className="ri-arrow-left-s-line text-xl"></i>
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white text-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                        >
                          <i className="ri-arrow-right-s-line text-xl"></i>
                        </button>
                      </>
                    )}

                    {singleProduct.image.length > 1 && (
                      <div className="flex justify-center mt-4 space-x-2 overflow-x-auto py-2">
                        {singleProduct.image.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                              currentImageIndex === index ? 'border-primary' : 'border-transparent'
                            }`}
                          >
                            <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-gray-100 rounded-md aspect-square flex items-center justify-center">
                    <p className="text-gray-500">لا توجد صور متاحة</p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:w-1/2 w-full" dir="rtl">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">{singleProduct.name}</h3>

                {isFabricProduct && isUser && (
                  <div className="mb-5">
                    <h4 className="text-lg font-bold text-gray-800 mb-2">اختيار التفصيل:</h4>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setTailoringMode('detail')}
                        className={`px-5 py-2 rounded-md font-medium shadow-sm transition-colors border ${
                          tailoringMode === 'detail'
                            ? 'bg-[#d3ae27] text-white border-[#d3ae27]'
                            : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        تفصيل (+ {tailoringFee} ر.ع)
                      </button>

                      <button
                        type="button"
                        onClick={() => setTailoringMode('without')}
                        className={`px-5 py-2 rounded-md font-medium shadow-sm transition-colors border ${
                          tailoringMode === 'without'
                            ? 'bg-[#d3ae27] text-white border-[#d3ae27]'
                            : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        بدون تفصيل
                      </button>
                    </div>

                    {tailoringMode === 'detail' && (
                      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h5 className="font-bold text-gray-800 mb-3">قياسات التفصيل</h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">الطول</label>
                            <input
                              value={measurements.length}
                              onChange={(e) => handleChangeMeasurement('length', e.target.value)}
                              type="number"
                              step="0.1"
                              min="0"
                              className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-200"
                              placeholder="مثال: 150"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-600 mb-1">العرض الأعلى</label>
                            <input
                              value={measurements.upperWidth}
                              onChange={(e) => handleChangeMeasurement('upperWidth', e.target.value)}
                              type="number"
                              step="0.1"
                              min="0"
                              className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-200"
                              placeholder="مثال: 55"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-600 mb-1">العرض الأسفل من الأعلى</label>
                            <input
                              value={measurements.lowerWidthFromTop}
                              onChange={(e) => handleChangeMeasurement('lowerWidthFromTop', e.target.value)}
                              type="number"
                              step="0.1"
                              min="0"
                              className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-200"
                              placeholder="مثال: 60"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-600 mb-1">قياس الرقبة</label>
                            <input
                              value={measurements.neck}
                              onChange={(e) => handleChangeMeasurement('neck', e.target.value)}
                              type="number"
                              step="0.1"
                              min="0"
                              className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-200"
                              placeholder="مثال: 38"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-600 mb-1">طول الردون</label>
                            <input
                              value={measurements.sleeveLength}
                              onChange={(e) => handleChangeMeasurement('sleeveLength', e.target.value)}
                              type="number"
                              step="0.1"
                              min="0"
                              className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-200"
                              placeholder="مثال: 60"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-600 mb-1">عرض الردون</label>
                            <input
                              value={measurements.sleeveWidth}
                              onChange={(e) => handleChangeMeasurement('sleeveWidth', e.target.value)}
                              type="number"
                              step="0.1"
                              min="0"
                              className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-200"
                              placeholder="مثال: 18"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-600 mb-1">قياس العرض السفلي الأخير</label>
                            <input
                              value={measurements.lastBottomWidth}
                              onChange={(e) => handleChangeMeasurement('lastBottomWidth', e.target.value)}
                              type="number"
                              step="0.1"
                              min="0"
                              className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-200"
                              placeholder="مثال: 70"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-600 mb-1">قياس الكتف</label>
                            <input
                              value={measurements.shoulder}
                              onChange={(e) => handleChangeMeasurement('shoulder', e.target.value)}
                              type="number"
                              step="0.1"
                              min="0"
                              className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-200"
                              placeholder="مثال: 45"
                            />
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 mt-3">
                          ملاحظة: أدخل القياسات بالأرقام فقط (مثلاً بالسنتيمتر).
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mb-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 inline-block mb-4">
                    <p className="text-xl md:text-2xl font-semibold text-amber-600">
                      {displayedTotalPrice} .ر.ع
                      {singleProduct.oldPrice && displayedTotalOldPrice > 0 && (
                        <s className="mr-2 text-gray-500 text-lg">.ر.ع {displayedTotalOldPrice}</s>
                      )}
                    </p>

                    {discountPercent !== null && (
                      <div className="text-green-600 font-medium mt-1">وفر {discountPercent}%</div>
                    )}
                  </div>

                  {isFabricProduct && isUser && tailoringMode === 'detail' && (
                    <div className="text-sm text-gray-700">
                      تم إضافة رسوم التفصيل: <span className="font-semibold">{tailoringFee} ر.ع</span>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-2">الوصف:</h4>
                  <p className="text-gray-600 leading-relaxed">{singleProduct.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500">الفئة:</h4>
                    <p className="text-gray-800 font-medium">{singleProduct.category}</p>
                  </div>

                  {singleProduct.gender && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500">النوع:</h4>
                      <p className="text-gray-800 font-medium">{singleProduct.gender}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-semibold text-gray-500">الكمية المتاحة:</h4>
                    <p
                      className={`text-gray-800 font-medium ${
                        singleProduct.quantity <= 0
                          ? 'text-red-600'
                          : singleProduct.quantity <= 5
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}
                    >
                      {singleProduct.quantity <= 0 ? 'نفذت الكمية' : `${singleProduct.quantity} قطع متبقية`}
                    </p>

                    {isShoeProduct && (
                      <p className="mt-2 text-sm text-gray-700">
                        يتوفر قياسات من <span className="font-semibold">(40 إلى 45)</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedQty((q) => Math.max(1, Number(q || 1) - 1))}
                        className="px-4 py-3 rounded-md font-medium shadow-md bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                        disabled={singleProduct.quantity <= 0}
                      >
                        -
                      </button>

                      <span className="min-w-[44px] text-center font-semibold text-gray-800">
                        {safeSelectedQty}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedQty((q) => {
                            const next = Number(q || 1) + 1;
                            return maxAddableQty > 0 ? Math.min(next, maxAddableQty) : 1;
                          })
                        }
                        className="px-4 py-3 rounded-md font-medium shadow-md bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                        disabled={singleProduct.quantity <= 0 || maxAddableQty <= 0}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(singleProduct);
                    }}
                    className={`px-8 py-3 text-white rounded-md font-medium transition-colors shadow-md ${
                      singleProduct.quantity <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#d3ae27] hover:bg-[#c19e22]'
                    }`}
                    disabled={singleProduct.quantity <= 0}
                  >
                    {singleProduct.quantity <= 0 ? 'نفذت الكمية' : 'إضافة إلى السلة'}
                  </button>

                  {singleProduct.quantity > 0 && singleProduct.quantity <= 5 && (
                    <span className="text-yellow-600 text-sm font-medium">
                      كمية محدودة! بقي {singleProduct.quantity} فقط
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-gray-50" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 border-b pb-2">تقييمات العملاء</h3>
            <ReviewsCard productReviews={productReviews} />
          </div>
        </div>
      </section>
    </>
  );
};

export default SingleProduct;
