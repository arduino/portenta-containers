import {
  useReadEthernetConnectionQuery,
  useReadWlanConnectionQuery,
} from "../services/networking";

/**
 * Utility hook, to return readable connection statuses.
 */
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
    wlan: {
      configured: Boolean(wlanConnection?.network),
      connected: Boolean(wlanConnection?.connected),
    },
    ethernet: {
      configured: Boolean(ethernetConnection?.network),
      connected: Boolean(ethernetConnection?.connected),
    },
  };
}
