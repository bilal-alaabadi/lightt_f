// src/pages/dashbord/admin/dashboard/AdminDMain.jsx
import React, { useMemo, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useGetAllOrdersQuery } from '../../../../redux/features/orders/orderApi';
import AdminStats from './AdminStats';

const AdminDMain = () => {
  const { user } = useSelector((state) => state.auth);

  // اجلب البيانات وتأكد أن لدينا مصفوفة طلبات دائمًا
  const { data, error, isLoading } = useGetAllOrdersQuery();
  const ordersList = Array.isArray(data) ? data : (data?.orders ?? []);

  // ====== فلتر الفترة (اليوم / أمس / 7 / 30 / 90 / الكل) ======
  const [days, setDays] = useState('7'); // 'today' | 'yesterday' | '7' | '30' | '90' | 'all'

  const filterByDays = useCallback((list, d) => {
    if (!Array.isArray(list)) return [];
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    if (d === 'today') {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return list.filter((o) => {
        const t = new Date(o?.createdAt || o?.updatedAt || 0);
        return t >= start && t <= end;
      });
    }

    if (d === 'yesterday') {
      const yStart = new Date(now);
      yStart.setDate(yStart.getDate() - 1);
      yStart.setHours(0, 0, 0, 0);
      const yEnd = new Date(yStart);
      yEnd.setHours(23, 59, 59, 999);
      return list.filter((o) => {
        const t = new Date(o?.createdAt || o?.updatedAt || 0);
        return t >= yStart && t <= yEnd;
      });
    }

    if (d === 'all') return list;

    const n = Number(d);
    if (!Number.isNaN(n) && n > 0) {
      const from = new Date(now);
      from.setDate(from.getDate() - (n - 1));
      from.setHours(0, 0, 0, 0);
      return list.filter((o) => {
        const t = new Date(o?.createdAt || o?.updatedAt || 0);
        return t >= from && t <= end;
      });
    }

    return list;
  }, []);

  const periodLabel = useMemo(() => {
    if (days === 'all') return 'كل الفترات';
    if (days === 'today') return 'اليوم';
    if (days === 'yesterday') return 'أمس';
    return `آخر ${days} يوم`;
  }, [days]);

  // ====== Helpers ======
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

  const getQty = (item) => Number(item?.quantity ?? item?.qty ?? 0) || 0;

  const lineRevenue = (item) => getSellPrice(item) * getQty(item);                      // قيمة السطر
  const lineProfit  = (item) => (getSellPrice(item) - getOriginalPrice(item)) * getQty(item); // ربح السطر

  const orderAgg = (order) => {
    if (!Array.isArray(order?.products)) return { revenue: 0, profit: 0 };
    return order.products.reduce(
      (acc, p) => ({
        revenue: acc.revenue + lineRevenue(p),
        profit:  acc.profit  + lineProfit(p),
      }),
      { revenue: 0, profit: 0 }
    );
  };

  const fmt = (n) =>
    new Intl.NumberFormat('ar-OM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      .format(Number(n) || 0) + ' ر.ع';

  const formatDate = (d) =>
    new Date(d).toLocaleString('ar-OM', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

  // ====== مجاميع كل الزمن (محل / متجر) ======
  const {
    ordersAmountStore,
    ordersAmountShop,
    netProfitStore,
    netProfitShop,
  } = useMemo(() => {
    const list = Array.isArray(ordersList) ? ordersList : [];

    let _ordersAmountStore = 0;
    let _ordersAmountShop  = 0;
    let _netProfitStore    = 0;
    let _netProfitShop     = 0;

    for (const o of list) {
      const { revenue, profit } = orderAgg(o);
      const isStore = o?.wilayat === 'محل';
      if (isStore) {
        _ordersAmountStore += revenue;
        _netProfitStore    += profit;
      } else {
        _ordersAmountShop  += revenue;
        _netProfitShop     += profit;
      }
    }

    return {
      ordersAmountStore: _ordersAmountStore,
      ordersAmountShop:  _ordersAmountShop,
      netProfitStore:    _netProfitStore,
      netProfitShop:     _netProfitShop,
    };
  }, [ordersList]);

  const netProfitTotal    = useMemo(() => (netProfitStore + netProfitShop), [netProfitStore, netProfitShop]);
  const ordersTotalAmount = useMemo(() => (ordersAmountStore + ordersAmountShop), [ordersAmountStore, ordersAmountShop]);

  // ====== تفاصيل الفترة + قائمة الطلبات للفترة ======
  const { periodRevenueTotal, periodProfitTotal, periodOrders } = useMemo(() => {
    const base = Array.isArray(ordersList) ? ordersList : [];
    const filtered = filterByDays(base, days).slice().sort(
      (a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt)
    );

    let rev = 0, prof = 0;
    const enhanced = filtered.map((o) => {
      const agg = orderAgg(o);
      rev  += agg.revenue;
      prof += agg.profit;
      return { ...o, __revenue: agg.revenue, __profit: agg.profit };
    });

    return {
      periodRevenueTotal: rev,
      periodProfitTotal:  prof,
      periodOrders: enhanced,
    };
  }, [ordersList, days, filterByDays]);

  // ====== مجاميع الفترة الحالية (محل / متجر) لتمريرها إلى AdminStats ======
  const periodShopStore = useMemo(() => {
    let pOrdersAmountStore = 0;
    let pOrdersAmountShop  = 0;
    let pNetProfitStore    = 0;
    let pNetProfitShop     = 0;

    for (const o of periodOrders) {
      const revenue = Number(o?.__revenue) || 0;
      const profit  = Number(o?.__profit)  || 0;
      const isStore = o?.wilayat === 'محل';
      if (isStore) {
        pOrdersAmountStore += revenue;
        pNetProfitStore    += profit;
      } else {
        pOrdersAmountShop  += revenue;
        pNetProfitShop     += profit;
      }
    }
    return { pOrdersAmountStore, pOrdersAmountShop, pNetProfitStore, pNetProfitShop };
  }, [periodOrders]);

  // ====== المودال (صفحة خفيّة) ======
  const [detailsType, setDetailsType] = useState(null);        // 'profit' | 'revenue' | null
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const openDetails = (type) => { setDetailsType(type); setExpandedOrderId(null); };
  const closeDetails = () => { setDetailsType(null); setExpandedOrderId(null); };

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-2xl font-semibold mb-2">لوحة تحكم المشرف</h1>
      <p className="text-gray-500 mb-4">{user?.username ? `${user.username}، أهلاً بك.` : 'مرحبًا بك.'}</p>

      {isLoading && <div className="mb-4">جاري التحميل...</div>}
      {error && <div className="mb-4 text-red-600">فشل تحميل البيانات!</div>}

      {/* قسم الإحصائيات العلوية المقسّم حسب الأيام (داخل AdminStats) */}
      {!isLoading && !error && (
        <AdminStats
          days={days}
          onChangeDays={setDays}
          periodLabel={periodLabel}
          // القيم المفلترة للفترة الحالية:
          statsPeriod={{
            netProfitShop:     periodShopStore.pNetProfitShop,
            netProfitStore:    periodShopStore.pNetProfitStore,
            ordersAmountShop:  periodShopStore.pOrdersAmountShop,
            ordersAmountStore: periodShopStore.pOrdersAmountStore,
          }}
          // (اختياري) إجماليات كل الزمن:
          statsAllTime={{
            netProfitShop,
            netProfitStore,
            ordersAmountShop,
            ordersAmountStore,
            netProfitTotal,
            ordersTotalAmount,
          }}
        />
      )}

      {/* ====== قسم تفاصيل الفترة مع بطاقتين (تفتح المودال) ====== */}
      {!isLoading && !error && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">تفاصيل الطلبات حسب الفترة</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{periodLabel}</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 grid-cols-1">
            {/* 1) إجمالي صافي الربح (للفترة) */}
            <button
              type="button"
              onClick={() => openDetails('profit')}
              className="text-right bg-white shadow-md rounded-lg p-5 border border-gray-200 hover:shadow-lg transition cursor-pointer"
              title="عرض تفاصيل الطلبات (صافي الربح)"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base md:text-lg font-semibold">إجمالي صافي الربح (للفترة)</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                  {periodLabel}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">(price - originalPrice) × الكمية</p>
              <div className={`text-3xl font-extrabold ${
                periodProfitTotal > 0 ? 'text-green-700' :
                periodProfitTotal < 0 ? 'text-red-700' : 'text-gray-700'
              }`}>
                {fmt(periodProfitTotal)}
              </div>
            </button>

            {/* 2) إجمالي الطلبات (قيمة فقط) (للفترة) */}
            <button
              type="button"
              onClick={() => openDetails('revenue')}
              className="text-right bg-white shadow-md rounded-lg p-5 border border-gray-200 hover:shadow-lg transition cursor-pointer"
              title="عرض تفاصيل الطلبات (قيمة فقط)"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base md:text-lg font-semibold">إجمالي الطلبات (قيمة فقط) (للفترة)</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {periodLabel}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">price × الكمية</p>
              <div className="text-3xl font-extrabold text-gray-800">
                {fmt(periodRevenueTotal)}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ====== المودال (الصفحة الخفيّة) ====== */}
      {detailsType && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[92vh] overflow-auto" dir="rtl">
            {/* رأس المودال */}
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {detailsType === 'profit' ? 'تفاصيل صافي الربح' : 'تفاصيل قيمة الطلبات'} — {periodLabel}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  اضغط على أي طلب لاستعراض أصناف الطلب (تفاصيل المنتجات).
                </p>
              </div>
              <button
                onClick={closeDetails}
                className="text-sm px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                إغلاق
              </button>
            </div>

            {/* ملخص أعلى */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-sm text-gray-500 mb-1">إجمالي صافي الربح في الفترة</p>
                <div className="text-2xl font-bold">{fmt(periodProfitTotal)}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-sm text-gray-500 mb-1">إجمالي الطلبات (قيمة) في الفترة</p>
                <div className="text-2xl font-bold">{fmt(periodRevenueTotal)}</div>
              </div>
            </div>

            {/* جدول الطلبات */}
            <div className="p-4 overflow-x-auto">
              {periodOrders.length === 0 ? (
                <div className="text-gray-500 p-4">لا توجد طلبات ضمن الفترة المحددة.</div>
              ) : (
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-3 text-right">رقم الطلب</th>
                      <th className="py-3 px-3 text-right">المصدر</th>
                      <th className="py-3 px-3 text-right">التاريخ</th>
                      <th className="py-3 px-3 text-right">قيمة الطلب</th>
                      <th className="py-3 px-3 text-right">صافي ربح الطلب</th>
                      <th className="py-3 px-3 text-right">تفاصيل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periodOrders.map((o, i) => {
                      const oid = o._id || o.orderId || String(i);
                      const expanded = expandedOrderId === oid;
                      return (
                        <React.Fragment key={oid}>
                          <tr className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                            <td className="py-2 px-3">{o.orderId || '--'}</td>
                            <td className="py-2 px-3">
                              {o.wilayat === 'محل'
                                ? <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">محل</span>
                                : <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">متجر</span>}
                            </td>
                            <td className="py-2 px-3">{formatDate(o.updatedAt || o.createdAt)}</td>
                            <td className="py-2 px-3">{fmt(o.__revenue)}</td>
                            <td className={`py-2 px-3 ${o.__profit > 0 ? 'text-green-700' : o.__profit < 0 ? 'text-red-700' : 'text-gray-700'}`}>
                              {fmt(o.__profit)}
                            </td>
                            <td className="py-2 px-3">
                              <button
                                onClick={() => setExpandedOrderId(expanded ? null : oid)}
                                className="text-sm text-indigo-600 hover:underline"
                              >
                                {expanded ? 'إخفاء' : 'عرض'}
                              </button>
                            </td>
                          </tr>

                          {/* تفاصيل المنتجات داخل الطلب */}
                          {expanded && Array.isArray(o.products) && (
                            <tr>
                              <td colSpan={6} className="p-0">
                                <div className="p-3 bg-gray-50 border-t">
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white border border-gray-200 rounded">
                                      <thead className="bg-gray-100">
                                        <tr>
                                          <th className="py-2 px-2 text-right">#</th>
                                          <th className="py-2 px-2 text-right">المنتج</th>
                                          <th className="py-2 px-2 text-right whitespace-nowrap">الكمية</th>
                                          <th className="py-2 px-2 text-right whitespace-nowrap">سعر البيع</th>
                                          <th className="py-2 px-2 text-right whitespace-nowrap">السعر الأصلي</th>
                                          <th className="py-2 px-2 text-right whitespace-nowrap">قيمة السطر</th>
                                          <th className="py-2 px-2 text-right whitespace-nowrap">ربح السطر</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {o.products.map((p, idx) => {
                                          const q  = Number(p?.quantity ?? p?.qty ?? 0) || 0;
                                          const sp = Number(p?.price ?? p?.product?.price ?? p?.productDetails?.price ?? p?.productId?.price ?? 0);
                                          const op = Number(p?.originalPrice ?? p?.product?.originalPrice ?? p?.productDetails?.originalPrice ?? p?.productId?.originalPrice ?? 0);
                                          const rowRev  = sp * q;
                                          const rowProf = (sp - op) * q;
                                          return (
                                            <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                                              <td className="py-2 px-2">{idx + 1}</td>
                                              <td className="py-2 px-2">{p?.name || 'منتج'}</td>
                                              <td className="py-2 px-2">{q}</td>
                                              <td className="py-2 px-2">{fmt(sp)}</td>
                                              <td className="py-2 px-2">{fmt(op)}</td>
                                              <td className="py-2 px-2">{fmt(rowRev)}</td>
                                              <td className={`py-2 px-2 ${rowProf > 0 ? 'text-green-700' : rowProf < 0 ? 'text-red-700' : 'text-gray-700'}`}>
                                                {fmt(rowProf)}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-4 border-t flex items-center justify-end">
              <button
                onClick={closeDetails}
                className="text-sm px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDMain;
