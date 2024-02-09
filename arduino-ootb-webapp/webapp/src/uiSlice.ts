import { createSlice } from "@reduxjs/toolkit";

interface UiState {
  wifiInfoOpen: boolean;
  ethernetInfoOpen: boolean;
  lteInfoOpen: boolean;
}

const initialState = {
  wifiInfoOpen: false,
  ethernetInfoOpen: false,
} as UiState;

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openWifiInfo(state) {
      state.wifiInfoOpen = true;
      state.ethernetInfoOpen = false;
      state.lteInfoOpen = false;
    },
    closeWifiInfo(state) {
      state.wifiInfoOpen = false;
    },
    openEthernetInfo(state) {
      state.ethernetInfoOpen = true;
      state.wifiInfoOpen = false;
      state.lteInfoOpen = false;
    },
    closeEthernetInfo(state) {
      state.ethernetInfoOpen = false;
    },
    openLteInfo(state) {
      state.lteInfoOpen = true;
      state.wifiInfoOpen = false;
      state.ethernetInfoOpen = false;
    },
    closeLteInfo(state) {
      state.lteInfoOpen = false;
    },
  },
});

export const {
  openWifiInfo,
  closeWifiInfo,
  openEthernetInfo,
  closeEthernetInfo,
  openLteInfo,
  closeLteInfo,
} = uiSlice.actions;
export default uiSlice.reducer;
