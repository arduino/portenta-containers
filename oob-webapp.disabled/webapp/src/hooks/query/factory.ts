import { useMutation, UseMutationOptions, useQuery } from "react-query";
import { createFactoryName, readFactoryName } from "../../api/factory";
import { FactoryNameInfo } from "../../entities";

export function useFactoryName() {
  return useQuery("factory", readFactoryName);
}

export function useRegisterFactoryNameMutation(
  options: Omit<
    UseMutationOptions<FactoryNameInfo, unknown, unknown, unknown>,
    "mutationFn"
  >
) {
  return useMutation(createFactoryName, options);
}
