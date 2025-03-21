// store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice"; // misol uchun

const store = configureStore({
  reducer: {
    auth: authReducer,
    // boshqalar...
  },
});

export default store;
