import { Board, BoardHostname } from "../entities";
import { baseApi, TAG_TYPES } from "./base";

export const boardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    readBoard: builder.query<Board, void>({
      query: () => ({ url: "board" }),
      providesTags: [TAG_TYPES.BOARD],
    }),
    readHostname: builder.query<BoardHostname, void>({
      query: () => ({ url: "board/hostname" }),
      providesTags: [TAG_TYPES.HOSTNAME],
    }),
    updateHostname: builder.mutation<BoardHostname, BoardHostname>({
      query: (hostname) => ({
        url: `board/hostname`,
        method: "PUT",
        body: hostname,
      }),
      invalidatesTags: () => [TAG_TYPES.HOSTNAME],
    }),
  }),
  overrideExisting: false,
});

export const {
  useReadBoardQuery,
  useReadHostnameQuery,
  useUpdateHostnameMutation,
} = boardApi;
