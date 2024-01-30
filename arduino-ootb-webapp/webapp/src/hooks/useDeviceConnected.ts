import { useMemo } from "react";
import {
  useReadEthernetConnectionQuery,
  useReadWlanConnectionQuery,
} from "../services/networking";

const queryParams = {
  pollingInterval: 5000,
};

/**
 * Utility hook, to return readable connection statuses.
 */
export function useDeviceConnectionStatus() {
  const wlanConnection = useReadWlanConnectionQuery(undefined, queryParams);
  const ethernetConnection = useReadEthernetConnectionQuery(
    undefined,
    queryParams,
  );

  return useMemo(
    () => ({
      configured: Boolean(
        wlanConnection.data?.network || ethernetConnection.data?.network,
      ),
      connected: Boolean(
        wlanConnection.data?.connected || ethernetConnection.data?.connected,
      ),
      wlan: {
        configured: Boolean(wlanConnection.data?.network),
        connected: Boolean(wlanConnection.data?.connected),
        connection: wlanConnection.data,
        isLoading: wlanConnection.isLoading,
      },
      ethernet: {
        configured: Boolean(ethernetConnection.data?.network),
        connected: Boolean(ethernetConnection.data?.connected),
        connection: ethernetConnection.data,
        isLoading: ethernetConnection.isLoading,
      },
      isLoading:
        (!wlanConnection.isSuccess &&
          !wlanConnection.isError &&
          !wlanConnection.isLoading) ||
        (!ethernetConnection.isSuccess &&
          !ethernetConnection.isError &&
          !ethernetConnection.isLoading),
    }),
    [ethernetConnection, wlanConnection],
  );
}
