import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import adminProductsSlice from "./admin/products-slice";
import shopProductsSlice from "./shop/products-slice";
import shopReviewSlice from "./shop/review-slice";
import shopCartSlice from "./shop/cart-slice";
import commonFeatureSlice from "./common-slice";
import shopAddressSlice from "./shop/address-slice";
import adminOrderSlice from "./admin/order-slice";
import shopOrderSlice from "./shop/order-slice";
import shopSearchSlice from "./shop/search-slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    adminProducts: adminProductsSlice,
    shopProducts: shopProductsSlice,
    shopCart: shopCartSlice,
    shopReview: shopReviewSlice,
    commonFeature: commonFeatureSlice,
    shopAddress: shopAddressSlice,
    adminOrder: adminOrderSlice,
    shopOrder: shopOrderSlice,
    shopSearch: shopSearchSlice,
  },
});

export default store;
