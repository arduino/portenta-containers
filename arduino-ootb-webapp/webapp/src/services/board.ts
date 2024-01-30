import {
  Board,
  BoardContainer,
  BoardHostname,
  BoardSystemStatus,
} from "../entities";
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
    readSystemStatus: builder.query<BoardSystemStatus, void>({
      // query: () => ({ url: "board/system-status" }),
      query: () => ({ url: "board" }),
      transformResponse: () => {
        return {
          mpuTemp: 70,
          totalRam: 2001544,
          usedRam: 382944,
          usedStorage: 9531840,
          percentStorage: "66%",
          linuxVersion: "5.10.93-lmp-standard",
          ootbVersion: "local-image",
        };
      },
      providesTags: [TAG_TYPES.BOARD_SYSTEM],
    }),
    readContainersStatus: builder.query<BoardContainer[], void>({
      // query: () => ({ url: "board/containers-status" }),
      query: () => ({ url: "board" }),
      transformResponse: () => {
        return [
          {
            name: "x8-webapp",
            status: "running",
          },
        ];
      },
      providesTags: [TAG_TYPES.BOARD_CONTAINERS],
    }),
  }),
  overrideExisting: false,
});

export const {
  useReadBoardQuery,
  useReadHostnameQuery,
  useUpdateHostnameMutation,
  useReadSystemStatusQuery,
  useReadContainersStatusQuery,
} = boardApi;
