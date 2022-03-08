import { Network, Connection } from "../entities";
import { baseApi, TAG_TYPES } from "./base";

export const networkingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    readWlanNetworkList: builder.query<Network[], void>({
      query: () => ({ url: "networking/wlan/networks" }),
      transformResponse: (data: Network[]) =>
        data.sort((a, b) => b.signal - a.signal),
      providesTags: [TAG_TYPES.NETWORKS],
    }),
    readWlanConnection: builder.query<Connection, void>({
      query: () => ({ url: "networking/wlan/connection" }),
      providesTags: [TAG_TYPES.WLAN],
    }),
    createWlanConnection: builder.mutation<
      Connection,
      { ssid: string; password?: string }
    >({
      query: (connection) => ({
        url: `networking/wlan/connection`,
        method: "PUT",
        body: connection,
      }),
      invalidatesTags: () => [TAG_TYPES.WLAN],
    }),
    readEthernetConnection: builder.query<Connection, void>({
      query: () => ({ url: "networking/ethernet/connection" }),
      providesTags: [TAG_TYPES.ETHERNET],
    }),
  }),
  overrideExisting: false,
});

export const {
  useReadWlanNetworkListQuery,
  useReadEthernetConnectionQuery,
  useReadWlanConnectionQuery,
  useCreateWlanConnectionMutation,
} = networkingApi;
