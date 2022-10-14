import {
  useReadEthernetConnectionQuery,
  useReadWlanConnectionQuery,
} from "../services/networking";

export function useDeviceConnectionStatus() {
  const { data: wlanConnection } = useReadWlanConnectionQuery(undefined, {
    pollingInterval: 30000,
  });
  const { data: ethernetConnection } = useReadEthernetConnectionQuery(
    undefined,
    {
      pollingInterval: 30000,
    }
  );

  return {
    configured: Boolean(wlanConnection?.network || ethernetConnection?.network),
    connected: Boolean(
      wlanConnection?.connected || ethernetConnection?.connected
    ),
  };
}
