import { createSlice } from "@reduxjs/toolkit";


const initialState = {
  store: {
    storeCode: "",
    storeName: "",
    storeDescription: "",
    activeCatalogId: 0,
    isDefault: false,
    logoDarkBg: "",
    logoLightBg: "",
    logoTransparent: "",
    catalogs: [],
    themeColor: "",
    themeContrastColor: "",
    tanyaThemeColor: "",
    tanyaThemeColorLight: "",
    favicon: "",
    websiteTitle: "",
    flowId: "",
    aliasId: "",
    searchConfigs: {
      endpoint: "",
      accessKey: "",
      secretKey: "",
    },
    homePageCategories: [],
    carouselImages: {
      web: [],
      mobile: [],
    },
    otherImages: {
      web: [],
      mobile: [],
    },
  },
  dateRange: {
    startDate: "2025-03-01",
    endDate: "2025-04-30",
  },
};

export const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
    setStore: (state, action) => {
      state.store = action.payload;
    },
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    }
  },
});

export const { setStore, setDateRange } = storeSlice.actions;

export default storeSlice.reducer;
