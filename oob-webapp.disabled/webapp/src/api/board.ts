import axios from "axios";
import { Board, BoardHostname } from "../entities";

export async function readBoard(): Promise<Board> {
  const { data } = await axios.get<Board>("/api/board");

  return data;
}

export async function readHostname(): Promise<BoardHostname> {
  const { data } = await axios.get<BoardHostname>("/api/board/hostname");

  return data;
}

export async function updateHostname(params: {
  hostname: string;
}): Promise<BoardHostname> {
  const { hostname } = params;

  const { data } = await axios.put("/api/board/hostname", {
    hostname,
  });

  return data;
}
