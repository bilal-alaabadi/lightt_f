// src/pages/dashbord/admin/AdminDashboard.jsx (أو المسار الذي عندك)
import React, { useMemo } from 'react';
import { useLogoutUserMutation } from '../../redux/features/auth/authApi';
import { useDispatch } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../../redux/features/auth/authSlice';
import { useFetchAllProductsQuery } from '../../redux/features/products/productsApi';

// القائمة الأصلية
const navItems = [
  { path: '/dashboard/admin', label: 'لوحة التحكم' },
  { path: '/dashboard/add-product', label: 'أضافة منتج' },
  { path: '/dashboard/manage-products', label: 'تعديل المنتجات' },
  { path: '/dashboard/users', label: 'المستخدمون' },
  { path: '/dashboard/manage-orders', label: 'أدارة الطلبات' },
];

const AdminDashboard = () => {
  const [logoutUser] = useLogoutUserMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // نجلب فقط المجموع عبر limit=1 (الـ API يعيد totalProducts)
  const { data: meta = {}, isLoading: isMetaLoading } = useFetchAllProductsQuery({
    category: '',
    minPrice: '',
    maxPrice: '',
    page: 1,
    limit: 1,
    search: '',
    sort: 'createdAt:desc',
  });

  const totalProducts = meta?.totalProducts ?? 0;
  const isLowCount = !isMetaLoading && totalProducts <= 3;

  // نرفع "تعديل المنتجات" للأعلى لو العدد قليل
  const orderedItems = useMemo(() => {
    if (!isLowCount) return navItems;
    const target = '/dashboard/manage-products';
    const important = navItems.find((i) => i.path === target);
    const others = navItems.filter((i) => i.path !== target);
    return important ? [important, ...others] : navItems;
  }, [isLowCount]);

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      dispatch(logout());
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // SVG بسيط لجرس أحمر صغير
  const Bell = () => (
    <svg
      viewBox="0 0 24 24"
      className="w-3.5 h-3.5 text-white"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z"
      />
    </svg>
  );

  return (
    <div className="space-y-5 bg-white p-8 md:h-screen flex flex-col justify-between">
      <div>
        <div className="nav__logo">
          <Link to="/">LIGHT</Link>
          <p className="text-xs italic">admin dashboard</p>
        </div>
        <hr className="mt-5" />
        <ul className="space-y-5 pt-5">
          {orderedItems.map((item) => {
            const isManageProducts = item.path === '/dashboard/manage-products';
            return (
              <li key={item.path} className="relative">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? 'text-blue-600 font-bold relative inline-flex items-center' : 'text-black relative inline-flex items-center'
                  }
                  end
                  to={item.path}
                >
                  {/* نص الرابط */}
                  <span className="relative">
                    {item.label}
                    {/* الجرس الأحمر: يظهر فقط إذا العدد قليل وعلى عنصر "تعديل المنتجات" */}
                    {isManageProducts && isLowCount && (
                      <span
                        className="absolute -top-2 -right-4 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-600 ring-2 ring-white"
                        title={`عدد المنتجات قليل (${totalProducts})`}
                      >
                        <Bell />
                      </span>
                    )}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mb-3">
        <hr className="mb-3" />
        <button
          onClick={handleLogout}
          className="text-white bg-[#CEAE7A] font-medium px-5 py-1 rounded-sm"
        >
          تسجيل خروج
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
