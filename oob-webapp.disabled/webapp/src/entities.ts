export interface Network {
  ssid: string;
  signal: number;
  security: string;
}

export interface Board {
  deviceModelName: string;
}
export interface BoardHostname {
  hostname: string;
}

export interface Connection {
  connected: boolean;
  network: string;
  ip: string;
  mac: string;
  gateway: string;
}

export interface FactoryNameInfo {
  registrationComplete: boolean;
  userCodeExpiryTimestamp: string;
  factoryName: string;
  userCode: string;
  browserURL: string;
}
