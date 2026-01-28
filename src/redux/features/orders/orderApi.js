import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getBaseUrl } from '../../../utils/baseURL';

const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/api/orders`,
    credentials: 'include',
  }),
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    getOrdersByEmail: builder.query({
      query: (email) => ({
        url: `/${email}`,
        method: 'GET',
      }),
      transformResponse: (response) => {
        return (response.orders || []).map((order) => ({
          ...order,
          products: (order.products || []).map((product) => ({
            ...product,
            name: product.name || product.productId?.name || 'منتج غير محدد',
            price: product.price ?? product.productId?.price ?? 0,
            image: product.image || product.productId?.image || 'https://via.placeholder.com/150',
            tailoring: product.tailoring
              ? {
                  ...product.tailoring,
                  fee: product.tailoring.fee ?? 0,
                  measurements: product.tailoring.measurements ?? null,
                }
              : null,
          })),
        }));
      },
      providesTags: ['Order'],
    }),

    getOrderById: builder.query({
      query: (orderId) => ({
        url: `/order/${orderId}`,
        method: 'GET',
      }),
      transformResponse: (order) => {
        if (!order) return order;
        return {
          ...order,
          products: (order.products || []).map((product) => ({
            ...product,
            name: product.name || product.productId?.name || 'منتج غير محدد',
            price: product.price ?? product.productId?.price ?? 0,
            image: product.image || product.productId?.image || 'https://via.placeholder.com/150',
            tailoring: product.tailoring
              ? {
                  ...product.tailoring,
                  fee: product.tailoring.fee ?? 0,
                  measurements: product.tailoring.measurements ?? null,
                }
              : null,
          })),
        };
      },
      providesTags: ['Order'],
    }),

    getAllOrders: builder.query({
      query: () => ({
        url: '',
        method: 'GET',
      }),
      transformResponse: (response) => {
        return (response || []).map((order) => ({
          ...order,
          products: (order.products || []).map((product) => ({
            ...product,
            name: product.name || product.productId?.name || 'منتج غير محدد',
            price: product.price ?? product.productId?.price ?? 0,
            image: product.image || product.productId?.image || 'https://via.placeholder.com/150',
            tailoring: product.tailoring
              ? {
                  ...product.tailoring,
                  fee: product.tailoring.fee ?? 0,
                  measurements: product.tailoring.measurements ?? null,
                }
              : null,
          })),
        }));
      },
      providesTags: ['Order'],
    }),

    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/update-order-status/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Order'],
    }),

    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/delete-order/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useGetOrdersByEmailQuery,
  useGetOrderByIdQuery,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} = orderApi;

export default orderApi;
