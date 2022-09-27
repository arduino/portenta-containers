import { IoTCloudRegistrationNameInfo } from "../entities";
import { baseApi, TAG_TYPES } from "./base";

export const factoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    readIoTCloudRegistration: builder.query<IoTCloudRegistrationNameInfo, void>(
      {
        query: () => ({
          url: "iot-cloud/registration",
          validateStatus: (response) => {
            return response.status === 200 || response.status === 404;
          },
        }),
        providesTags: [TAG_TYPES.IOT_CLOUD_REGISTRATION],
      }
    ),
    createIoTCloudRegistration: builder.mutation<
      IoTCloudRegistrationNameInfo,
      { clientId: string; clientSecret: string; deviceName: string }
    >({
      query: (registrationInfo) => ({
        url: `iot-cloud/registration`,
        method: "POST",
        body: registrationInfo,
      }),
      invalidatesTags: () => [TAG_TYPES.IOT_CLOUD_REGISTRATION],
    }),
    // deleteRequest: builder.mutation({
    //   query: () => ({
    //     url: `factory/request`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: () => [TAG_TYPES.FACTORY_NAME],
    // }),
  }),
  overrideExisting: false,
});

export const {
  useReadIoTCloudRegistrationQuery,
  useCreateIoTCloudRegistrationMutation,
} = factoryApi;
