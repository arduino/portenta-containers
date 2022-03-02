import { useQuery, useMutation, UseMutationOptions } from "react-query";
import {
  createConnection,
  readConnection,
  readNetworkList,
} from "../../api/wlan";

export function useNetworkList() {
  return useQuery("posts", readNetworkList);
}

export function useConnection() {
  return useQuery("connection", readConnection);
}

export function useConnectMutation(
  options: Omit<
    UseMutationOptions<void, unknown, unknown, unknown>,
    "mutationFn"
  >
) {
  return useMutation(createConnection, options);
}
