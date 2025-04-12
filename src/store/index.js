import { configureStore } from "@reduxjs/toolkit";
import storeReducer from "./reducer/storeReducer";

const store = configureStore({
  reducer: {
    store: storeReducer,
  },
});

export default store;
