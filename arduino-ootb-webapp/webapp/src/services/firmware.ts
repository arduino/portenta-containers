import { Firmware, FirmwareStatus } from "../entities";
import { baseApi, TAG_TYPES } from "./base";

export const firmwareApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    readUpdateAvailable: builder.query<Firmware, void>({
      query: () => ({ url: "firmware/update/avaliable" }),
      providesTags: [TAG_TYPES.FIRMWARE_AVAILABLE],
    }),
    downloadFirmware: builder.mutation<FirmwareStatus, void>({
      query: () => ({
        url: `firmware/update/download`,
        method: "POST",
      }),
    }),
    installFirmware: builder.mutation<FirmwareStatus, void>({
      query: () => ({
        url: `firmware/update/install`,
        method: "POST",
      }),
    }),
    readProgress: builder.query<FirmwareStatus, void>({
      query: () => ({ url: "firmware/update/progress" }),
      providesTags: [TAG_TYPES.FIRMWARE_UPDATE],
    }),
  }),
  overrideExisting: false,
});

export const {
  useReadUpdateAvailableQuery,
  useDownloadFirmwareMutation,
  useInstallFirmwareMutation,
  useReadProgressQuery,
} = firmwareApi;
