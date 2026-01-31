import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../../redux/features/cart/cartSlice';
import { Link } from 'react-router-dom';

const OrderSummary = ({ onClose = () => {} }) => {
  const dispatch = useDispatch();

  const { selectedItems = 0, totalPrice = 0 } =
    useSelector((store) => store.cart) || {};
  const { user } = useSelector((store) => store.auth) || {};

  const isPrivileged = user?.role === 'admin' || user?.role === 'user';
  const BASE_SHIPPING_FEE = 2;
  const shippingFee = isPrivileged ? 0 : BASE_SHIPPING_FEE;

  const grandTotal = (Number(totalPrice) + Number(shippingFee)).toFixed(2);

  return (
    <div className="bg-[#FAEBD7] mt-5 rounded text-base">
      <div className="px-6 py-4 space-y-5">
        <h2 className="text-xl text-text-dark">ملخص الطلب</h2>

        <p>العناصر المحددة: {selectedItems}</p>
        <p>السعر الفرعي: ر.ع{totalPrice.toFixed(2)}</p>
        <p>رسوم الشحن: ر.ع{shippingFee.toFixed(2)}</p>

        <p className="font-bold">
          الإجمالي النهائي: ر.ع{grandTotal}
        </p>

        <button
          onClick={() => dispatch(clearCart())}
          className="bg-red-500 px-3 py-1.5 text-white rounded-md"
        >
          تفريغ السلة
        </button>

        <Link to="/checkout">
          <button
            onClick={onClose}
            className="bg-green-600 px-3 py-1.5 text-white rounded-md mt-2"
          >
            إتمام الشراء
          </button>
        </Link>
      </div>
    </div>
  );
};

export default OrderSummary;
