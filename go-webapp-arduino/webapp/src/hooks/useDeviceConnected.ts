import {
  useReadEthernetConnectionQuery,
  useReadWlanConnectionQuery,
} from "../services/networking";

export function useDeviceConnected() {
  const { data: connection } = useReadWlanConnectionQuery(undefined, {
    pollingInterval: 30000,
  });
  const { data: ethernetConnection } = useReadEthernetConnectionQuery(
    undefined,
    {
      pollingInterval: 30000,
    }
  );

  return connection?.connected || ethernetConnection?.connected;
}
