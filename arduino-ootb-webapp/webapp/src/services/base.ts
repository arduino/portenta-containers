import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const TAG_TYPES = {
  BOARD_CONTAINERS: "BoardContainers",
  BOARD_SYSTEM: "BoardSystem",
  BOARD: "Board",
  ETHERNET: "Ethernet",
  FACTORY_NAME: "FactoryName",
  FIRMWARE_AVAILABLE: "FirmwareAvailable",
  FIRMWARE_UPDATE: "FirmwareUpdate",
  HOSTNAME: "Hostname",
  IOT_CLOUD_REGISTRATION: "IotCloudRegistration",
  LTE: "Lte",
  NETWORKS: "Networks",
  WLAN: "Wlan",
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
  tagTypes: Object.values(TAG_TYPES),
  endpoints: () => ({}),
  refetchOnFocus: true,
  refetchOnMountOrArgChange: true,
  refetchOnReconnect: true,
});
