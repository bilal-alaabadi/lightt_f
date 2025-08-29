// src/pages/dashbord/admin/dashboard/AdminStats.jsx
import React from 'react';

const AdminStats = ({ days, onChangeDays, periodLabel, statsPeriod, statsAllTime }) => {
  const fmt = (n) =>
    new Intl.NumberFormat('ar-OM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      .format(Number(n) || 0) + ' ر.ع';

  // نعرض دائمًا القيم المفلترة للفترة الحالية:
  const s = statsPeriod ?? {};

  return (
    <div className="my-5 space-y-4" dir="rtl">
      {/* شريط التحكّم بالفترة (مثل الأيام) */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">إحصائيات حسب الفترة</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="days" className="text-sm text-gray-600">المدة:</label>
          <select
            id="days"
            value={days}
            onChange={(e) => onChangeDays?.(e.target.value)}
            className="border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="today">اليوم</option>
            <option value="yesterday">أمس</option>
            <option value="7">آخر 7 أيام</option>
            <option value="30">آخر 30 يومًا</option>
            <option value="90">آخر 90 يومًا</option>
            <option value="all">كل الفترات</option>
          </select>
        </div>
      </div>

      {/* وسم الفترة الحالية */}
      <div className="text-xs px-2 py-0.5 rounded-full bg-gray-100 inline-block text-gray-700">
        {periodLabel}
      </div>

      {/* الشبكة: متجر + محل */}
      <div className="grid gap-4 md:grid-cols-2 sm:grid-cols-2 grid-cols-1 mt-3">
        {/* المتجر */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <h3 className="text-base font-semibold mb-3">📦 المتجر (ضمن {periodLabel})</h3>
          <div className="grid gap-4 grid-cols-1">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-sm text-gray-600 mb-1">صافي الربح من المتجر</p>
              <div className="text-2xl font-bold">{fmt(s?.netProfitShop)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-sm text-gray-600 mb-1">مبيعات من المتجر (قيمة)</p>
              <div className="text-2xl font-bold">{fmt(s?.ordersAmountShop)}</div>
            </div>
          </div>
        </div>

        {/* المحل */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <h3 className="text-base font-semibold mb-3">🏪 المحل (ضمن {periodLabel})</h3>
          <div className="grid gap-4 grid-cols-1">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-sm text-gray-600 mb-1">صافي الربح من المحل</p>
              <div className="text-2xl font-bold">{fmt(s?.netProfitStore)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-sm text-gray-600 mb-1">مبيعات من المحل (قيمة)</p>
              <div className="text-2xl font-bold">{fmt(s?.ordersAmountStore)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* (اختياري) تلميح إن كنت تعرض "كل الفترات" */}
      {days === 'all' && statsAllTime && (
        <p className="text-xs text-gray-500 mt-2">
          * القيم المعروضة تمثل إجمالي كل الفترات.
        </p>
      )}
    </div>
  );
};

export default AdminStats;
