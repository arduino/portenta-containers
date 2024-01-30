import {
  EthernetConnection,
  EthernetConnectionPayload,
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
  }),
  overrideExisting: false,
});

export const {
  useReadWlanNetworkListQuery,
  useReadEthernetConnectionQuery,
  useReadWlanConnectionQuery,
  useCreateWlanConnectionMutation,
  useCreateEthernetConnectionMutation,
} = networkingApi;
