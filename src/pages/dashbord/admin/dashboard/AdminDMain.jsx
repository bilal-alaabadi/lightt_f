// src/pages/dashbord/admin/dashboard/AdminDMain.jsx
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetAdminStatsQuery } from '../../../../redux/features/stats/statsApi';
import { useGetAllOrdersQuery } from '../../../../redux/features/orders/orderApi';
import AdminStats from './AdminStats';
import AdminStatsChart from './AdminStatsChart';
import { FaStore } from 'react-icons/fa';

const AdminDMain = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // API
  const { data: stats, error: statsError, isLoading: statsLoading } = useGetAdminStatsQuery();
  const { data: orders, error: ordersError, isLoading: ordersLoading } = useGetAllOrdersQuery();

  // تنسيقات
  const fmt = (n) =>
    new Intl.NumberFormat('ar-OM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      .format(Number(n) || 0) + ' ر.ع';

  // أرباح بدون الشحن (حسب منطقك السابق)
  const earningsWithoutShipping =
    (Number(stats?.totalEarnings) || 0) - ((Number(stats?.totalOrders) || 0) * 2);

  // Helpers آمنة للمسارات المختلفة
  const getOriginalPrice = (item) =>
    Number(
      item?.originalPrice ??
      item?.product?.originalPrice ??
      item?.productDetails?.originalPrice ??
      item?.productId?.originalPrice ??
      0
    );

  const getSellPrice = (item) =>
    Number(
      item?.price ??
      item?.product?.price ??
      item?.productDetails?.price ??
      item?.productId?.price ??
      0
    );

  const getName = (item) =>
    item?.name || item?.product?.name || item?.productDetails?.name || item?.productId?.name || 'منتج';

  const getQty = (item) => Number(item?.quantity ?? item?.qty ?? 0) || 0;

  // ربح سطر
  const lineProfit = (item) => (getSellPrice(item) - getOriginalPrice(item)) * getQty(item);

  // ربح الطلب
  const orderProfit = (order) => {
    if (!Array.isArray(order?.products)) return 0;
    return order.products.reduce((sum, p) => sum + lineProfit(p), 0);
  };

  // أرباح المحل
  const storeProfit = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    return list
      .filter(o => o?.wilayat === 'محل')
      .reduce((acc, o) => acc + orderProfit(o), 0);
  }, [orders]);

  // أرباح المتجر (بدون الشحن)
  const shopProfitWithoutShipping = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    return list
      .filter(o => o?.wilayat !== 'محل')
      .reduce((acc, o) => acc + orderProfit(o), 0);
  }, [orders]);

  // إجمالي الأرباح (المحل + المتجر الإلكتروني)
  const totalProfit = useMemo(() => {
    return (storeProfit || 0) + (shopProfitWithoutShipping || 0);
  }, [storeProfit, shopProfitWithoutShipping]);

  const profitClass = (v, base) =>
    (v > 0 ? `${base} text-green-700` : v < 0 ? `${base} text-red-700` : `${base} text-gray-700`);

  // ------- تفاصيل المنتجات (سطر-بسطر) -------
  // عناصر المحل
  const storeLines = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    return list
      .filter(o => o?.wilayat === 'محل')
      .flatMap((o) => (Array.isArray(o.products) ? o.products : []).map((p, idx) => ({
        key: `${o._id || 'order'}-${idx}`,
        orderId: o?.orderId || '--',
        name: getName(p),
        qty: getQty(p),
        price: getSellPrice(p),
        originalPrice: getOriginalPrice(p),
        profit: lineProfit(p),
      })));
  }, [orders]);

  // عناصر المتجر
  const shopLines = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    return list
      .filter(o => o?.wilayat !== 'محل')
      .flatMap((o) => (Array.isArray(o.products) ? o.products : []).map((p, idx) => ({
        key: `${o._id || 'order'}-${idx}`,
        orderId: o?.orderId || '--',
        name: getName(p),
        qty: getQty(p),
        price: getSellPrice(p),
        originalPrice: getOriginalPrice(p),
        profit: lineProfit(p),
      })));
  }, [orders]);

  // حوارات التفاصيل
  const [showStoreDetails, setShowStoreDetails] = useState(false);
  const [showShopDetails, setShowShopDetails] = useState(false);

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-2xl font-semibold mb-4">لوحة تحكم المشرف</h1>
      <p className="text-gray-500">{user?.username}! مرحبًا بك في لوحة تحكم الإدارة.</p>

      {(statsLoading || ordersLoading) && <div className="mb-4">جاري التحميل...</div>}
      {(statsError || ordersError) && <div className="mb-4 text-red-600">فشل تحميل البيانات!</div>}
      {!stats && !(statsLoading || ordersLoading) && <div className="mb-4">لم يتم العثور على أي إحصائيات</div>}

      {/* البطاقات: أرباح + تفاصيل */}
      <div className="my-5 grid gap-4 md:grid-cols-2 grid-cols-1">
        {/* أرباح المحل */}
        <div
          className="bg-white shadow-md rounded-lg p-5 border border-gray-200 cursor-pointer hover:shadow-lg transition"
          onClick={() => navigate('/dashboard/manage-orders?type=store')}
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold">أرباح المحل</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm inline-flex items-center gap-1">
                <FaStore className="text-green-600" />
                محل
              </span>
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-3">الصيغة: (price - originalPrice) × الكمية</p>
          <div className={profitClass(storeProfit, "text-3xl font-extrabold")}>{fmt(storeProfit)}</div>
        </div>

        {/* أرباح المتجر */}
        <div
          className="bg-white shadow-md rounded-lg p-5 border border-gray-200 cursor-pointer hover:shadow-lg transition"
          onClick={() => navigate('/dashboard/manage-orders?type=shop')}
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold">أرباح المتجر (بدون الشحن)</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              طلبات المتجر الاكتروني
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-3">الصيغة: (price - originalPrice) × الكمية</p>
          <div className={profitClass(shopProfitWithoutShipping, "text-3xl font-extrabold")}>
            {fmt(shopProfitWithoutShipping)}
          </div>
        </div>

        {/* إجمالي الأرباح (مربع جديد) */}
        <div
          className="bg-white shadow-md rounded-lg p-5 border border-gray-200"
          role="region"
          aria-label="إجمالي الأرباح"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold">إجمالي الأرباح (محل + متجر)</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              مجموع
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-3">المجموع = أرباح المحل + أرباح المتجر الإلكتروني</p>
          <div className={profitClass(totalProfit, "text-3xl font-extrabold")}>{fmt(totalProfit)}</div>
        </div>
      </div>

      {/* البطاقات الجديدة: تفاصيل المنتجات */}
      <div className="my-5 grid gap-4 md:grid-cols-2 grid-cols-1">
        {/* تفاصيل منتجات المحل */}
        <div
          className="bg-white shadow-md rounded-lg p-5 border border-gray-200 cursor-pointer hover:shadow-lg transition"
          onClick={() => setShowStoreDetails(true)}
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold">تفاصيل طلبات المحل</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {storeLines.length} عنصر
            </span>
          </div>
          <p className="text-sm text-gray-500">عرض كل العناصر المطلوبة من المحل مع السعرين والربح.</p>
        </div>

        {/* تفاصيل منتجات المتجر */}
        <div
          className="bg-white shadow-md rounded-lg p-5 border border-gray-200 cursor-pointer hover:shadow-lg transition"
          onClick={() => setShowShopDetails(true)}
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold">تفاصيل طلبات المتجر</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              {shopLines.length} عنصر
            </span>
          </div>
          <p className="text-sm text-gray-500">عرض كل العناصر المطلوبة من المتجر مع السعرين والربح.</p>
        </div>
      </div>

      {/* جداول التفاصيل - مودالات */}
      {showStoreDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">تفاصيل منتجات المحل</h3>
              <button
                onClick={() => setShowStoreDetails(false)}
                className="text-sm px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                إغلاق
              </button>
            </div>
            <div className="p-4 overflow-x-auto">
              {storeLines.length === 0 ? (
                <div className="text-gray-500">لا توجد عناصر.</div>
              ) : (
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-3 text-right">رقم الطلب</th>
                      <th className="py-3 px-3 text-right">المنتج</th>
                      <th className="py-3 px-3 text-right">الكمية</th>
                      <th className="py-3 px-3 text-right">السعر الحالي</th>
                      <th className="py-3 px-3 text-right">السعر الأصلي</th>
                      <th className="py-3 px-3 text-right">ربح السطر</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeLines.map((row, i) => (
                      <tr key={row.key} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="py-2 px-3">{row.orderId}</td>
                        <td className="py-2 px-3">{row.name}</td>
                        <td className="py-2 px-3">{row.qty}</td>
                        <td className="py-2 px-3">{fmt(row.price)}</td>
                        <td className="py-2 px-3">{fmt(row.originalPrice)}</td>
                        <td className={`py-2 px-3 ${row.profit > 0 ? 'text-green-700' : row.profit < 0 ? 'text-red-700' : 'text-gray-700'}`}>
                          {fmt(row.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {showShopDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">تفاصيل منتجات المتجر</h3>
              <button
                onClick={() => setShowShopDetails(false)}
                className="text-sm px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                إغلاق
              </button>
            </div>
            <div className="p-4 overflow-x-auto">
              {shopLines.length === 0 ? (
                <div className="text-gray-500">لا توجد عناصر.</div>
              ) : (
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-3 text-right">رقم الطلب</th>
                      <th className="py-3 px-3 text-right">المنتج</th>
                      <th className="py-3 px-3 text-right">الكمية</th>
                      <th className="py-3 px-3 text-right">السعر الحالي</th>
                      <th className="py-3 px-3 text-right">السعر الأصلي</th>
                      <th className="py-3 px-3 text-right">ربح السطر</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shopLines.map((row, i) => (
                      <tr key={row.key} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="py-2 px-3">{row.orderId}</td>
                        <td className="py-2 px-3">{row.name}</td>
                        <td className="py-2 px-3">{row.qty}</td>
                        <td className="py-2 px-3">{fmt(row.price)}</td>
                        <td className="py-2 px-3">{fmt(row.originalPrice)}</td>
                        <td className={`py-2 px-3 ${row.profit > 0 ? 'text-green-700' : row.profit < 0 ? 'text-red-700' : 'text-gray-700'}`}>
                          {fmt(row.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* إحصائيات إضافية */}
      {stats && (
        <>
          <AdminStats stats={{ ...stats, totalEarnings: earningsWithoutShipping }} />
          <AdminStatsChart stats={{ ...stats, totalEarnings: earningsWithoutShipping }} />
        </>
      )}
    </div>
  );
};

export default AdminDMain;
