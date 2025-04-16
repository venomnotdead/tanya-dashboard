import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getContentfulImages } from "../../contentful/getContentFulImages";

interface ImageState {
  loading: boolean;
  error: string | null;
  favicon: string | null;
  logo: string | null;
}

const initialState: ImageState = {
  loading: false,
  error: null,
  favicon: "",
  logo: "",
};



export const fetchStoreAssets = createAsyncThunk(
  "images/fetchStoreAssets",
  async (storeCode: string, { rejectWithValue }) => {
    try {
      const fieldName = `${storeCode}Images`; 
      const assets = await getContentfulImages(fieldName);

      const favicon = assets[0];
      const logo = assets[1];

      return { favicon, logo };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const imageSlice = createSlice({
  name: "images",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStoreAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStoreAssets.fulfilled, (state, action) => {
        state.favicon = action.payload.favicon || "";
        state.logo = action.payload.logo || ""
        state.loading = false;
      })
      .addCase(fetchStoreAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default imageSlice.reducer;
