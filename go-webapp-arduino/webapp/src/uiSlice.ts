import { createSlice } from "@reduxjs/toolkit";

interface UiState {
  wifiInfoOpen: boolean;
  ethernetInfoOpen: boolean;
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
    },
    closeWifiInfo(state) {
      state.wifiInfoOpen = false;
    },
    openEthernetInfo(state) {
      state.ethernetInfoOpen = true;
      state.wifiInfoOpen = false;
    },
    closeEthernetInfo(state) {
      state.ethernetInfoOpen = false;
    },
  },
});

export const {
  openWifiInfo,
  closeWifiInfo,
  openEthernetInfo,
  closeEthernetInfo,
} = uiSlice.actions;
export default uiSlice.reducer;
