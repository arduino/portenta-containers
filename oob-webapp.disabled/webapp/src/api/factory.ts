import axios from "axios";
import { FactoryNameInfo } from "../entities";

export async function readFactoryName(): Promise<FactoryNameInfo> {
  const { data } = await axios.get<FactoryNameInfo>("/api/factory/name");

  return data;
}

export async function createFactoryName(params: {
  name: string;
}): Promise<FactoryNameInfo> {
  const { name } = params;

  const { data } = await axios.post<FactoryNameInfo>("/api/factory/name", {
    name,
  });

  return data;
}
