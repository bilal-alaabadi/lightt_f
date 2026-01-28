// CartModal.jsx
import React from 'react';
import OrderSummary from './OrderSummary';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, updateQuantity } from '../../redux/features/cart/cartSlice';

const CartModal = ({ products, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.products);

  const handleQuantity = (type, id) => {
    const product = cartItems.find(item => item._id === id);
    if (!product) return;

    if (type === 'increment' && product.quantity >= product.maxQuantity) {
      alert('لقد وصلت إلى الحد الأقصى للكمية المتاحة لهذا المنتج');
      return;
    }

    const payload = { type, id };
    dispatch(updateQuantity(payload));
  };

  const handleRemove = (e, id) => {
    e.preventDefault();
    dispatch(removeFromCart({ id }));
  };

  return (
    <div
      className={`fixed z-[1000] inset-0 bg-black bg-opacity-80 transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ transition: 'opacity 300ms' }}
    >
      <div
        className={`fixed right-0 top-0 md:w-1/3 w-full bg-white h-full overflow-y-auto transition-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ transition: 'transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94' }}
      >
        <div className='p-4 mt-4'>
          <div className='flex justify-between items-center mb-4'>
            <h4 className='text-xl font-semibold'>سلة التسوق</h4>
            <button
              onClick={() => onClose()}
              className='text-gray-600 hover:text-gray-900'
            >
              <i className="ri-xrp-fill bg-black p-1 text-white"></i>
            </button>
          </div>

          <div className='cart-items'>
            {products.length === 0 ? (
              <div>سلة التسوق فارغة</div>
            ) : (
              products.map((item, index) => (
                <div
                  key={index}
                  className='flex flex-col md:flex-row md:items-center md:justify-between shadow-md md:p-5 p-2 mb-4'
                >
                  <div className='flex items-start w-full'>
                    <span className='mr-4 px-1 bg-primary text-white rounded-full'>
                      0{index + 1}
                    </span>

                    <img
                      src={Array.isArray(item.image) ? item.image[0] : item.image}
                      alt={item.name}
                      className='size-12 object-cover mr-4'
                    />

                    <div className="flex-1">
                      <h5 className='text-lg font-medium'>{item.name}</h5>
                      <p className='text-gray-600 text-sm'>
                        ر.ع{Number(item.price).toFixed(2)}
                      </p>

                      {item.tailoring?.mode && (
                        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-md p-2">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">التفصيل:</span>{' '}
                            {item.tailoring.mode === 'detail' ? 'تفصيل' : 'بدون تفصيل'}
                          </p>

                          {item.tailoring.mode === 'detail' && (
                            <>
                              <p className="text-sm text-gray-700">
                                <span className="font-semibold">رسوم التفصيل:</span>{' '}
                                {Number(item.tailoring.fee || 0).toFixed(2)} ر.ع
                              </p>

                              {item.tailoring.measurements && (
                                <div className="mt-2 text-sm text-gray-700 space-y-1">
                                  <p><span className="font-semibold">الطول:</span> {item.tailoring.measurements.length}</p>
                                  <p><span className="font-semibold">العرض الأعلى:</span> {item.tailoring.measurements.upperWidth}</p>
                                  <p><span className="font-semibold">العرض الأسفل من الأعلى:</span> {item.tailoring.measurements.lowerWidthFromTop}</p>
                                  <p><span className="font-semibold">قياس الرقبة:</span> {item.tailoring.measurements.neck}</p>
                                  <p><span className="font-semibold">طول الردون:</span> {item.tailoring.measurements.sleeveLength}</p>
                                  <p><span className="font-semibold">عرض الردون:</span> {item.tailoring.measurements.sleeveWidth}</p>
                                  <p><span className="font-semibold">قياس العرض السفلي الأخير:</span> {item.tailoring.measurements.lastBottomWidth}</p>
                                  <p><span className="font-semibold">قياس الكتف:</span> {item.tailoring.measurements.shoulder}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      <div className='flex flex-row md:justify-start justify-end items-center mt-3'>
                        <button
                          onClick={() => handleQuantity('decrement', item._id)}
                          className='size-6 flex items-center justify-center px-1.5 rounded-full bg-gray-200 text-gray-700 hover:bg-primary hover:text-white ml-8'
                        >
                          -
                        </button>
                        <span className='px-2 text-center mx-1'>{item.quantity}</span>
                        <button
                          onClick={() => handleQuantity('increment', item._id)}
                          className='size-6 flex items-center justify-center px-1.5 rounded-full bg-gray-200 text-gray-700 hover:bg-primary hover:text-white'
                        >
                          +
                        </button>
                        <div className='ml-5'>
                          <button
                            onClick={(e) => handleRemove(e, item._id)}
                            className='text-red-500 hover:text-red-800 mr-4'
                          >
                            إزالة
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>

          {products.length > 0 && <OrderSummary onClose={onClose} />}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
