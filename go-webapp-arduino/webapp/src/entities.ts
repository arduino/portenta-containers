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

export interface Connection {
  connected: boolean;
  network: string;
  ip: string;
  mac: string;
  gateway: string;
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
  deviceName: string | null;
  deviceNameSuggested: boolean;
  registered: boolean;
  deviceId?: string | null;
  thingId?: string | null;
}

export interface IoTCloudRegistrationRequest {
  clientId: string;
  clientSecret: string;
  deviceName: string;
}

export interface IoTCloudRegistrationResult {
  deviceName: string;
  thingName: string;
  deviceId: string;
  thingId: string;
}
