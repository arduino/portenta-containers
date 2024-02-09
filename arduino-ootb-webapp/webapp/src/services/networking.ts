import {
  EthernetConnection,
  EthernetConnectionPayload,
  LteConnection,
  LteConnectionPayload,
  Network,
  WlanConnection,
} from "../entities";
import { baseApi, TAG_TYPES } from "./base";

export const networkingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    readWlanNetworkList: builder.query<Network[], void>({
      query: () => ({ url: "networking/wlan/networks" }),
      transformResponse: (data: Network[]) =>
        data.sort((a, b) => b.signal - a.signal),
      providesTags: [TAG_TYPES.NETWORKS],
    }),
    readWlanConnection: builder.query<WlanConnection, void>({
      query: () => ({ url: "networking/wlan/connection" }),
      providesTags: [TAG_TYPES.WLAN],
    }),
    createWlanConnection: builder.mutation<
      WlanConnection,
      { ssid: string; password?: string }
    >({
      query: (connection) => ({
        url: `networking/wlan/connection`,
        method: "PUT",
        body: connection,
      }),
      invalidatesTags: () => [TAG_TYPES.WLAN],
    }),
    readEthernetConnection: builder.query<WlanConnection, void>({
      query: () => ({ url: "networking/ethernet/connection" }),
      providesTags: [TAG_TYPES.ETHERNET],
    }),
    createEthernetConnection: builder.mutation<
      EthernetConnection,
      EthernetConnectionPayload
    >({
      query: (connection) => ({
        url: `networking/ethernet/connection`,
        method: "POST",
        body: connection,
      }),
      invalidatesTags: () => [TAG_TYPES.ETHERNET],
    }),
    readLteConnection: builder.query<LteConnection, void>({
      query: () => ({ url: "networking/modem/connection" }),
      transformResponse: (data) => {
        // return {
        //   connected: true,
        //   ip: "123.45.67.89",
        //   accessTechnology: "4g/LTE",
        //   signalStrength: -77,
        //   locationInfo: "???",
        //   carrier: "WINDTRE",
        //   serialNumber: "XXXXXXX",
        //   apn: "mobile.vodafone.it",
        //   pin: "12345",
        //   papChapUsername: "fio",
        //   modemName: "QUECTEL Mobile Broadband Module",
        // };
        return data as LteConnection;
      },
      providesTags: [TAG_TYPES.LTE],
    }),
    createLteConnection: builder.mutation<LteConnection, LteConnectionPayload>({
      query: (connection) => ({
        url: `networking/modem/connection`,
        method: "POST",
        body: connection,
      }),
      invalidatesTags: () => [TAG_TYPES.LTE],
    }),
  }),
  overrideExisting: false,
});

export const {
  useReadWlanNetworkListQuery,
  useReadEthernetConnectionQuery,
  useReadWlanConnectionQuery,
  useReadLteConnectionQuery,
  useCreateWlanConnectionMutation,
  useCreateEthernetConnectionMutation,
  useCreateLteConnectionMutation,
} = networkingApi;
