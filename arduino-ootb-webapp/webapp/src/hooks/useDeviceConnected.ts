import { useMemo } from "react";
import {
  useReadEthernetConnectionQuery,
  useReadLteConnectionQuery,
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
  const lteConnection = useReadLteConnectionQuery(undefined, queryParams);

  return useMemo(
    () => ({
      configured: Boolean(
        wlanConnection.data?.network ||
          ethernetConnection.data?.network ||
          lteConnection.data?.carrier,
      ),
      connected: Boolean(
        wlanConnection.data?.connected ||
          ethernetConnection.data?.connected ||
          lteConnection.data?.connected,
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
      lte: {
        configured: Boolean(lteConnection.data?.carrier),
        connected: Boolean(lteConnection.data?.connected === "Connected"),
        connection: lteConnection.data,
        isLoading:
          lteConnection.isLoading ||
          lteConnection.data?.connected === "Connecting" ||
          lteConnection.data?.connected === "Scanning",
      },
      isLoading:
        (!wlanConnection.isSuccess &&
          !wlanConnection.isError &&
          !wlanConnection.isLoading) ||
        (!ethernetConnection.isSuccess &&
          !ethernetConnection.isError &&
          !ethernetConnection.isLoading) ||
        (!lteConnection.isSuccess &&
          !lteConnection.isError &&
          !lteConnection.isLoading),
    }),
    [
      ethernetConnection.data,
      ethernetConnection.isError,
      ethernetConnection.isLoading,
      ethernetConnection.isSuccess,
      lteConnection.data,
      lteConnection.isError,
      lteConnection.isLoading,
      lteConnection.isSuccess,
      wlanConnection.data,
      wlanConnection.isError,
      wlanConnection.isLoading,
      wlanConnection.isSuccess,
    ],
  );
}
