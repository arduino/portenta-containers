import { FactoryNameInfo } from "../entities";
import { baseApi, TAG_TYPES } from "./base";

export const factoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    readFactoryName: builder.query<FactoryNameInfo, void>({
      query: () => ({
        url: "factory/name",
        validateStatus: (response) => {
          return response.status === 200 || response.status === 404;
        },
      }),
      providesTags: [TAG_TYPES.FACTORY_NAME],
    }),
    createFactoryName: builder.mutation<
      FactoryNameInfo,
      { factoryName: string; boardName: string }
    >({
      query: (factoryName) => ({
        url: `factory/name`,
        method: "POST",
        body: factoryName,
      }),
      invalidatesTags: () => [TAG_TYPES.FACTORY_NAME],
    }),
    deleteRequest: builder.mutation({
      query: () => ({
        url: `factory/request`,
        method: "DELETE",
      }),
      invalidatesTags: () => [TAG_TYPES.FACTORY_NAME],
    }),
  }),
  overrideExisting: false,
});

export const {
  useReadFactoryNameQuery,
  useCreateFactoryNameMutation,
  useDeleteRequestMutation,
} = factoryApi;
