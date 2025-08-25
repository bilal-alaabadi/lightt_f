import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getBaseUrl } from "../../../utils/baseURL";

const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/api/products`,
    credentials: "include",
  }),
  tagTypes: ["Product", "ProductList"],
  endpoints: (builder) => ({
    // جلب قائمة المنتجات (يدعم: category, gender, page, limit)
    fetchAllProducts: builder.query({
      query: ({ category, gender, page = 1, limit = 10 } = {}) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (category && category !== "الكل") params.set("category", category);
        if (gender && gender !== "الكل") params.set("gender", gender);
        return `/?${params.toString()}`;
      },
      transformResponse: (response) => ({
        products: Array.isArray(response?.products) ? response.products : [],
        totalPages: Number(response?.totalPages) || 0,
        totalProducts: Number(response?.totalProducts) || 0,
      }),
      providesTags: (result) =>
        result?.products
          ? [
              ...result.products.map(({ _id }) => ({ type: "Product", id: _id })),
              "ProductList",
            ]
          : ["ProductList"],
    }),

    // جلب منتج واحد
    fetchProductById: builder.query({
      query: (id) => `/${id}`,
      transformResponse: (response) => {
        const product = response?.product || {};
        // ضمان وجود الحقول الرقمية
        return {
          ...response,
          product: {
            ...product,
            price: Number(product?.price) || 0,
            oldPrice:
              product?.oldPrice === null || product?.oldPrice === undefined
                ? null
                : Number(product?.oldPrice),
            originalPrice:
              product?.originalPrice === null || product?.originalPrice === undefined
                ? null
                : Number(product?.originalPrice),
            quantity: Number(product?.quantity) || 0,
          },
        };
      },
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    // إنشاء منتج جديد (JSON)
    addProduct: builder.mutation({
      query: (newProduct) => ({
        url: "/create-product",
        method: "POST",
        body: newProduct,
        credentials: "include",
      }),
      invalidatesTags: ["ProductList"],
    }),

    // تحديث منتج (يدعم FormData للتعامل مع الصورة)
    updateProduct: builder.mutation({
      query: ({ id, body }) => ({
        url: `/update-product/${id}`,
        method: "PATCH",
        body, // يمكن أن يكون FormData أو JSON
        credentials: "include",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Product", id },
        "ProductList",
      ],
    }),

    // تحديث الكمية فقط (هيدر خاص)
    updateProductQuantity: builder.mutation({
      query: ({ id, quantity }) => ({
        url: `/update-product/${id}`,
        method: "PATCH",
        body: { quantity },
        credentials: "include",
        headers: { "X-Quantity-Only": "true" },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Product", id },
        "ProductList",
      ],
    }),

    // حذف منتج
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Product", id },
        "ProductList",
      ],
    }),

    // البحث عن منتجات
    searchProducts: builder.query({
      query: (searchTerm) => ({
        url: "/search",
        params: { q: searchTerm },
      }),
      transformResponse: (response) =>
        Array.isArray(response)
          ? response.map((p) => ({
              ...p,
              price: Number(p?.price) || 0,
              oldPrice:
                p?.oldPrice === null || p?.oldPrice === undefined
                  ? null
                  : Number(p?.oldPrice),
              originalPrice:
                p?.originalPrice === null || p?.originalPrice === undefined
                  ? null
                  : Number(p?.originalPrice),
              quantity: Number(p?.quantity) || 0,
            }))
          : [],
      providesTags: ["ProductList"],
    }),
  }),
});

export const {
  useFetchAllProductsQuery,
  useFetchProductByIdQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useUpdateProductQuantityMutation,
  useDeleteProductMutation,
  useSearchProductsQuery,
  useLazyFetchAllProductsQuery,
  useLazySearchProductsQuery,
} = productsApi;

export default productsApi;
