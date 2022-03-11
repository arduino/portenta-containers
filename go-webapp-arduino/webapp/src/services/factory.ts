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
    createFactoryName: builder.mutation<FactoryNameInfo, { name: string }>({
      query: (factoryName) => ({
        url: `factory/name`,
        method: "POST",
        body: factoryName,
      }),
      invalidatesTags: () => [TAG_TYPES.FACTORY_NAME],
    }),
  }),
  overrideExisting: false,
});

export const { useReadFactoryNameQuery, useCreateFactoryNameMutation } =
  factoryApi;
