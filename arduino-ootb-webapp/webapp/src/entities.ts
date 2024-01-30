export interface Network {
  ssid: string;
  bssid: string;
  signal: number;
  security: string;
}

export interface Board {
  deviceModelName: string;
}
export interface BoardHostname {
  hostname: string;
}

export interface BoardSystemStatus {
  mpuTemp: number;
  totalRam: number;
  usedRam: number;
  usedStorage: number;
  percentStorage: string;
  linuxVersion: string;
  ootbVersion: string;
}

export interface BoardContainer {
  name: string;
  status: string;
}

export interface WlanConnection {
  connected: boolean;
  network: string;
  ip: string;
  mac: string;
  gateway: string;
  alternateDns: string;
  preferredDns: string;
  cidrIpv4?: string;
  isDhcp: boolean;
  subnet: "255.255.255.0";
}

export interface EthernetConnection {
  connected: boolean;
  network: string;
  ip: string;
  mac: string;
  gateway: string;
}

export interface EthernetConnectionPayload {
  ip?: string;
  subnet?: string;
  gateway?: string;
  preferredDns?: string;
  alternateDns?: string;
}

export interface FactoryNameInfo {
  userCodeExpiresIn: number;
  factoryName: string;
  userCode: string;
  browserURL: string;
  authenticationPending: boolean;
  authenticationExpired: boolean;
  registrationComplete: boolean;
}

export interface IoTCloudRegistrationStatus {
  deviceId?: string | null;
  deviceName?: string | null;
  deviceNameSuggested: boolean;
  registered: boolean;
  thingId?: string | null;
  thingName: string | null;
  dashboardId?: string | null;
  dashboardName: string | null;
}

export interface IoTCloudRegistrationRequest {
  clientId: string;
  clientSecret: string;
  organizationId?: string;
  deviceName: string;
}

export interface Firmware {
  updateAvailable: string;
}

export interface FirmwareStatus {
  percentage: number;
  md5Error: string;
  untarError: string;
  status: string;
  offlineUpdateError: string;
}
