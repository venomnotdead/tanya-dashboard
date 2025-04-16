import { configureStore } from "@reduxjs/toolkit";
import storeReducer from "./reducer/storeReducer";
import imageReducer from "./reducer/cmsReducer";

const store = configureStore({
  reducer: {
    store: storeReducer,
    cmsImage: imageReducer
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;