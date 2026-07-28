import { createSlice } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'product',
  initialState: {
    list: [],
    featured: [],
    newArrivals: [],
    current: null,
    total: 0,
    page: 1,
    limit: 12,
    filters: {
      category: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      sort: 'newest',
      search: '',
    },
    loading: false,
    error: null,
  },
  reducers: {
    setProducts: (state, action) => {
      state.list = action.payload.products;
      state.total = action.payload.total;
    },
    setFeatured: (state, action) => {
      state.featured = action.payload;
    },
    setNewArrivals: (state, action) => {
      state.newArrivals = action.payload;
    },
    setCurrentProduct: (state, action) => {
      state.current = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    resetFilters: (state) => {
      state.filters = {
        category: '',
        minPrice: '',
        maxPrice: '',
        rating: '',
        sort: 'newest',
        search: '',
      };
      state.page = 1;
    },
    setProductLoading: (state, action) => {
      state.loading = action.payload;
    },
    setProductError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setProducts, setFeatured, setNewArrivals, setCurrentProduct,
  setFilters, setPage, resetFilters, setProductLoading, setProductError,
} = productSlice.actions;

export const selectProducts = (state) => state.product.list;
export const selectCurrentProduct = (state) => state.product.current;
export const selectProductFilters = (state) => state.product.filters;
export const selectProductPage = (state) => state.product.page;

export default productSlice.reducer;
