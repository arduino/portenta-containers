import { z } from "zod";

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
  id: string;
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
  subnet: string;
  ignoreAutoDns: boolean;
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
export interface LteConnection {
  connected: "Registered" | "Scanning" | "Connecting" | "Locked" | "Connected";
  ip?: string;
  modemName: string;
  accessTechnology?: string;
  signalStrength?: number;
  locationInfo?: string;
  carrier?: string;
  serialNumber?: string;
  apn?: string;
  pin?: string;
  papChapUsername?: string;
  rxPower?: string;
  quality?: string;
  operatorName: string;
  unlockRetries: number;
}

export interface LteConnectionPayload {
  apn: string;
  pin?: string;
  papChapUsername?: string;
  papChapPassword?: string;
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

export const FirmwareSchema = z.object({
  updateAvailable: z.boolean(), // z.enum(["up-to-date", "update-available", "update-expired"]),
});

export type Firmware = z.infer<typeof FirmwareSchema>;

export const FirmwareStatusSchema = z.object({
  percentage: z.number(),
  status: z.enum([
    "idle",
    "download-in-progress",
    "download-md5",
    "download-completed",
    "download-expired",
    "install-untar",
    "install-in-progress",
    "install-dbus",
    "install-completed",
  ]),
  md5Error: z.string().nullable(),
  untarError: z.string().nullable(),
  offlineUpdateError: z.string().nullable(),
});

export type FirmwareStatus = z.infer<typeof FirmwareStatusSchema>;
