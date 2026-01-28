// cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  selectedItems: 0,
  totalPrice: 0,
  shippingFee: 2,
};

const BULK_THRESHOLD = 3;
const BULK_DISCOUNT_RATE = 0.2;

const normalizeArabic = (s) => {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/[ًٌٍَُِّْ]/g, "") // تشكيل
    .replace(/أ|إ|آ/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي");
};

const isGhutra = (product) => {
  const cat = normalizeArabic(product?.category);
  const name = normalizeArabic(product?.name);

  // يدعم: غتر / غتره / غتره قطن / غترة قطن ... إلخ
  const isByCategory = cat.includes("غتر") || cat.includes("غتره") || cat.includes("غتره");
  const isByName = name.includes("غتر") || name.includes("غتره") || name.includes("غتره");

  return isByCategory || isByName;
};

const recomputeCart = (state) => {
  state.selectedItems = state.products.reduce((sum, p) => sum + p.quantity, 0);

  const totalGhutraQty = state.products
    .filter(isGhutra)
    .reduce((sum, p) => sum + p.quantity, 0);

  const applyBulkDiscount = totalGhutraQty >= BULK_THRESHOLD;

  let total = 0;

  state.products.forEach((product) => {
    const unitPrice = Number(product.price || 0);
    const lineTotal = unitPrice * product.quantity;

    if (isGhutra(product) && applyBulkDiscount) {
      total += lineTotal * (1 - BULK_DISCOUNT_RATE);
    } else {
      total += lineTotal;
    }
  });

  state.totalPrice = Number(total.toFixed(2));
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      if (!product || !product._id) return;

      const maxQty = Number(product.quantity || 0);
      if (!Number.isFinite(maxQty) || maxQty <= 0) return;

      const existing = state.products.find((p) => p._id === product._id);

      if (!existing) {
        state.products.push({
          ...product,
          quantity: 1,
          maxQuantity: maxQty,
          url: `/product/${product._id}`,
        });
      } else {
        if (existing.quantity >= existing.maxQuantity) return;
        existing.quantity += 1;
      }

      recomputeCart(state);
    },

    updateQuantity: (state, action) => {
      const { id, type } = action.payload || {};
      const product = state.products.find((p) => p._id === id);
      if (!product) return;

      if (type === "increment") {
        if (product.quantity < product.maxQuantity) {
          product.quantity += 1;
        }
      }

      if (type === "decrement") {
        if (product.quantity > 1) {
          product.quantity -= 1;
        }
      }

      recomputeCart(state);
    },

    removeFromCart: (state, action) => {
      state.products = state.products.filter((p) => p._id !== action.payload.id);
      recomputeCart(state);
    },

    clearCart: (state) => {
      state.products = [];
      state.selectedItems = 0;
      state.totalPrice = 0;
      state.shippingFee = 2;
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
