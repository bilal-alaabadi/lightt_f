import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../../redux/features/cart/cartSlice';
import { Link } from 'react-router-dom';

const OrderSummary = ({ onClose = () => {} }) => {
  const dispatch = useDispatch();

  const { selectedItems = 0, totalPrice = 0, products = [] } =
    useSelector((store) => store.cart) || {};
  const { user } = useSelector((store) => store.auth) || {};

  const isPrivileged = user?.role === 'admin' || user?.role === 'user';
  const BASE_SHIPPING_FEE = 2;
  const shippingFee = isPrivileged ? 0 : BASE_SHIPPING_FEE;

  const normalizeArabic = (s) =>
    String(s ?? '')
      .trim()
      .toLowerCase()
      .replace(/[ًٌٍَُِّْ]/g, '')
      .replace(/أ|إ|آ/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي');

  const isGhutra = (product) => {
    const cat = normalizeArabic(product?.category);
    const name = normalizeArabic(product?.name);
    return cat.includes('غتر') || name.includes('غتر');
  };

  const BULK_THRESHOLD = 3;
  const BULK_DISCOUNT_PERCENT = 20;

  const totalGhutraQty = products
    .filter(isGhutra)
    .reduce((sum, p) => sum + Number(p.quantity || 0), 0);

  const hasDiscount = totalGhutraQty >= BULK_THRESHOLD;
  const needsOneMore = totalGhutraQty === BULK_THRESHOLD - 1; // = 2

  const grandTotal = (Number(totalPrice) + Number(shippingFee)).toFixed(2);

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  return (
    <div className="bg-[#FAEBD7] mt-5 rounded text-base">
      <div className="px-6 py-4 space-y-5">
        <h2 className="text-xl text-text-dark">ملخص الطلب</h2>
        <p className="text-text-dark mt-2">العناصر المحددة: {selectedItems}</p>

        <div className="text-text-dark">
          <p>السعر الفرعي: ر.ع{totalPrice?.toFixed(2) || '0.00'}</p>
          <p>رسوم الشحن: ر.ع{shippingFee.toFixed(2)}</p>

          {hasDiscount && (
            <p className="font-bold mt-2 text-green-700">
              حصلت على خصم {BULK_DISCOUNT_PERCENT}% ✅
            </p>
          )}

          {needsOneMore && (
            <p className="font-bold mt-2 text-orange-700">
              أضف واحدة حتى تحصل على خصم {BULK_DISCOUNT_PERCENT}% 🔥
            </p>
          )}

          <p className="font-bold mt-2">
            الإجمالي النهائي: ر.ع{grandTotal}
          </p>
        </div>

        <div className="px-4 mb-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClearCart();
            }}
            className="bg-red-500 px-3 py-1.5 text-white mt-2 rounded-md flex justify-between items-center mb-4"
          >
            <span className="mr-2">تفريغ السلة</span>
            <i className="ri-delete-bin-7-line"></i>
          </button>

          <Link to="/checkout">
            <button
              onClick={onClose}
              className="bg-green-600 px-3 py-1.5 text-white mt-2 rounded-md flex justify-between items-center"
            >
              <span className="mr-2">إتمام الشراء</span>
              <i className="ri-bank-card-line"></i>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
