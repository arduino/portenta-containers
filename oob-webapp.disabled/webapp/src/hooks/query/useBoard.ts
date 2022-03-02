import { useMutation, UseMutationOptions, useQuery } from "react-query";
import { readBoard, readHostname, updateHostname } from "../../api/board";
import { BoardHostname } from "../../entities";

export function useBoard() {
  return useQuery("board", readBoard);
}

export function useBoardHostname() {
  return useQuery("boardHostname", readHostname);
}

export function useUpdateHostnameMutation(
  options: Omit<
    UseMutationOptions<BoardHostname, unknown, unknown, unknown>,
    "mutationFn"
  >
) {
  return useMutation(updateHostname, options);
}
