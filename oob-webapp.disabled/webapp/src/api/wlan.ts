import axios from "axios";
import { Network, Connection } from "../entities";

export async function readNetworkList(): Promise<Network[]> {
  const { data } = await axios.get<Network[]>("/api/wlan/networks");

  return data.sort((a, b) => b.signal - a.signal);
}

export async function readConnection(): Promise<Connection> {
  const { data } = await axios.get<Connection>("/api/wlan/connection");

  return data;
}

export async function createConnection(params: {
  ssid: string;
  password: string;
}): Promise<void> {
  const { ssid, password } = params;

  const { data } = await axios.put("/api/wlan/connection", {
    ssid,
    password,
  });

  return data;
}
