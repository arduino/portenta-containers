import {
  IoTCloudRegistrationStatus,
  IoTCloudRegistrationRequest,
  IoTCloudRegistrationResult,
} from "../entities";
import { baseApi, TAG_TYPES } from "./base";

export const factoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    readIoTCloudRegistration: builder.query<IoTCloudRegistrationStatus, void>({
      query: () => ({
        url: "iot-cloud/registration",
        validateStatus: (response) => {
          return response.status === 200 || response.status === 404;
        },
      }),
      providesTags: [TAG_TYPES.IOT_CLOUD_REGISTRATION],
    }),
    createIoTCloudRegistration: builder.mutation<
      IoTCloudRegistrationResult,
      IoTCloudRegistrationRequest
    >({
      query: (registrationInfo) => ({
        url: `iot-cloud/registration`,
        method: "POST",
        body: registrationInfo,
      }),
      invalidatesTags: () => [TAG_TYPES.IOT_CLOUD_REGISTRATION],
    }),
    deleteIoTCloudRegistration: builder.mutation({
      query: () => ({
        url: `iot-cloud/registration`,
        method: "DELETE",
      }),
      invalidatesTags: () => [TAG_TYPES.IOT_CLOUD_REGISTRATION],
    }),
  }),
  overrideExisting: false,
});

export const {
  useReadIoTCloudRegistrationQuery,
  useCreateIoTCloudRegistrationMutation,
  useDeleteIoTCloudRegistrationMutation,
} = factoryApi;
