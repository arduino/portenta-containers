import { createSlice } from "@reduxjs/toolkit";

interface UiState {
  wifiInfoOpen: boolean;
}

const initialState = {
  wifiInfoOpen: false,
} as UiState;

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openWifiInfo(state) {
      state.wifiInfoOpen = true;
    },
    closeWifiInfo(state) {
      state.wifiInfoOpen = false;
    },
  },
});

export const { openWifiInfo, closeWifiInfo } = uiSlice.actions;
export default uiSlice.reducer;
