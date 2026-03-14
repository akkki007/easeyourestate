import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchProperties = createAsyncThunk(
  "properties/fetch",
  async (filters: any) => {
    const params = new URLSearchParams(filters).toString();

    const res = await fetch(`/api/properties/search?${params}`);
    const data = await res.json();
    return data.listings;
  }
);

const propertySlice = createSlice({
  name: "properties",
  initialState: {
    properties: [],
    filters: {},
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProperties.fulfilled, (state, action) => {
      state.properties = action.payload;
    });
  },
});

export const { setFilters } = propertySlice.actions;

export default propertySlice.reducer;