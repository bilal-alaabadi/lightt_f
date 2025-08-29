import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDeleteProductMutation, useFetchAllProductsQuery } from '../../../../redux/features/products/productsApi';

const ManageProduct = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const {
    data: { products = [], totalPages = 1, totalProducts = 0 } = {},
    isLoading,
    error,
    refetch,
  } = useFetchAllProductsQuery({
    category: '',
    minPrice: '',
    maxPrice: '',
    page: currentPage,
    limit: productsPerPage,
    search: searchTerm,
    sort: `${sortField}:${sortOrder}`,
  });

  // 🔴 هل يوجد منتجات منخفضة المخزون (≤ 3)؟
  const lowStockProducts = useMemo(() => products.filter(p => (Number(p?.quantity) || 0) <= 3), [products]);
  const hasLowStock = lowStockProducts.length > 0;

  // لو فيه نقص مخزون: نثبّت الفرز على الأحدث ونعرض المنتجات منخفضة المخزون أولاً
  useEffect(() => {
    if (hasLowStock) {
      setSortField('createdAt');
      setSortOrder('desc');
    }
  }, [hasLowStock]);

  // نعرض المنتجات مع وضع قليلة المخزون في الأعلى (داخل الصفحة الحالية فقط)
  const displayedProducts = useMemo(() => {
    if (!hasLowStock) return products;
    const low = products.filter(p => (Number(p?.quantity) || 0) <= 3);
    const rest = products.filter(p => (Number(p?.quantity) || 0) > 3);
    return [...low, ...rest];
  }, [products, hasLowStock]);

  const startProduct = totalProducts === 0 ? 0 : (currentPage - 1) * productsPerPage + 1;
  const endProduct = totalProducts === 0 ? 0 : startProduct + products.length - 1;

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const [deleteProduct] = useDeleteProductMutation();
  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm('هل أنت متأكد أنك تريد حذف هذا المنتج؟');
    if (!confirmDelete) return;

    try {
      await deleteProduct(id).unwrap();
      alert('تم حذف المنتج بنجاح');
      await refetch();
    } catch (error) {
      console.error('خطأ في حذف المنتج', error);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <section className="py-4 bg-gray-100 text-right w-full">
      <div className="sm:px-4">
        <div className="bg-white shadow-lg rounded-lg p-4">
          {/* تنبيه عام عند وجود منتجات منخفضة المخزون */}
          {hasLowStock && (
            <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-red-800">تنبيه مخزون منخفض:</p>
                  <p className="text-red-700">
                    يوجد منتجات عددها ≤ 3. تم وضعها في أعلى القائمة وإبرازها باللون الأحمر.
                  </p>
                </div>
                <Link
                  to="/dashboard/add-product"
                  className="shrink-0 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs sm:text-sm"
                >
                  + إضافة منتج
                </Link>
              </div>
            </div>
          )}

          {/* رأس الصفحة */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <h3 className="text-lg font-semibold">إدارة المنتجات</h3>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="ابحث عن منتج..."
                className="px-3 py-1 border rounded text-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {!hasLowStock && (
                <Link
                  to="/dashboard/add-product"
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm text-center"
                >
                  إضافة منتج جديد
                </Link>
              )}
            </div>
          </div>

          <p className="text-sm text-center sm:text-right mb-4">
            عرض {startProduct} إلى {endProduct} من {totalProducts} منتج
          </p>

          {isLoading && <div className="text-center py-8">جاري تحميل المنتجات...</div>}
          {error && <div className="text-center text-red-500 py-8">حدث خطأ أثناء تحميل المنتجات.</div>}

          {!isLoading && !error && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white shadow-md rounded-lg text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2">#</th>
                      <th
                        className="p-2 cursor-pointer"
                        onClick={() => handleSort('name')}
                        title="ترتيب حسب الاسم"
                      >
                        اسم المنتج {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="p-2">الصورة</th>
                      <th
                        className="p-2 cursor-pointer"
                        onClick={() => handleSort('price')}
                        title="ترتيب حسب السعر"
                      >
                        السعر {sortField === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="p-2">الكمية</th>
                      <th className="p-2">الفئة</th>
                      <th className="p-2">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedProducts.map((product, index) => {
                      const qty = Number(product?.quantity) || 0;
                      const isLow = qty <= 3;
                      return (
                        <tr
                          key={product._id}
                          className={`border-b hover:bg-gray-50 ${isLow ? 'bg-red-50/60' : ''}`}
                        >
                          <td className="p-2 text-center">{startProduct + index}</td>
                          <td className="p-2 text-center">{product.name}</td>
                          <td className="p-2 text-center">
                            {Array.isArray(product.image) && product.image.length > 0 ? (
                              <img
                                src={product.image[0]}
                                alt={product.name}
                                className="w-10 h-10 object-cover mx-auto rounded"
                              />
                            ) : typeof product.image === 'string' && product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-10 h-10 object-cover mx-auto rounded"
                              />
                            ) : (
                              <span className="text-gray-400">لا توجد صورة</span>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex flex-col">
                              <span className="font-semibold">{product.price} ر.ع</span>
                              {product.oldPrice && (
                                <span className="text-xs text-gray-500 line-through">
                                  {product.oldPrice} ر.ع
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            <div className="inline-flex items-center gap-2">
                              <span>{qty}</span>
                              {isLow && (
                                <span className="px-2 py-0.5 text-[10px] rounded-full bg-red-600 text-white">
                                  باقي {qty}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-2 text-center">{product.category}</td>
                          <td className="p-2 text-center space-x-1">
                            <Link
                              to={`/dashboard/update-product/${product._id}`}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-xs sm:text-sm inline-block"
                            >
                              تعديل
                            </Link>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs sm:text-sm"
                            >
                              حذف
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {displayedProducts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-gray-500">
                          لا توجد منتجات حالياً. ابدأ بإضافة منتج جديد.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex justify-center space-x-1 sm:space-x-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    السابق
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index + 1)}
                      className={`px-3 py-1 rounded ${
                        currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    التالي
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ManageProduct;
