export type SensorType = "RADAR" | "OPTICAL" | "RF";
export type SensorStatus = "NOMINAL" | "DEGRADED" | "OFFLINE" | "UNKNOWN";
export type AlertSeverity = "WARNING" | "CRITICAL";
export type AlertType = "SENSOR_OUTAGE" | "MISSED_PASS";
export type ObType = "RADAR" | "OPTICAL" | "RF";

export interface Sensor {
  id: string;
  name: string;
  type: SensorType;
  site_id: string;
  status: SensorStatus;
  last_ob_epoch: string | null;
  obs_last_24h: number;
}

export interface SiteLocation {
  lat: number;
  lon: number;
}

export interface SiteStatus {
  id: string;
  name: string;
  location: SiteLocation;
  sensors: Sensor[];
  overall_status: SensorStatus;
  obs_last_24h: number;
  last_ob_epoch: string | null;
  active_alert_count: number;
}

export interface BaseObservation {
  ob_id: string;
  sensor_id: string;
  epoch: string;
  catalog_number: string | null;
  ob_type: ObType;
}

export interface RadarObservation extends BaseObservation {
  ob_type: "RADAR";
  range_km: number | null;
  range_rate_km_s: number | null;
  azimuth_deg: number | null;
  elevation_deg: number | null;
  snr_db: number | null;
}

export interface OpticalObservation extends BaseObservation {
  ob_type: "OPTICAL";
  right_ascension_deg: number | null;
  declination_deg: number | null;
  magnitude: number | null;
  track_length_s: number | null;
}

export interface RFObservation extends BaseObservation {
  ob_type: "RF";
  frequency_mhz: number | null;
  eirp_dbw: number | null;
}

export type AnyObservation = RadarObservation | OpticalObservation | RFObservation;

export interface Alert {
  id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  site_id: string;
  sensor_id: string | null;
  message: string;
  triggered_at: string;
}
