// Hand-written mirrors of the Pydantic models in backend/models/*.py — keep in sync.

export type Technology = "Convencional" | "EFB" | "AGM";
export type Polarity = "D" | "E";

export interface BatteryIn {
  code: string;
  brand: string;
  line: string;
  ah: number;
  cca: number | null;
  technology: Technology;
  polarity: Polarity;
  length_mm: number | null;
  width_mm: number | null;
  height_mm: number | null;
  image_url: string | null;
  price: number | null;
  in_stock: boolean | null;
  notes: string;
}

export interface Battery extends BatteryIn {
  id: string;
}

export interface VehicleIn {
  make: string;
  model: string;
  engine: string;
  version: string;
  year_from: number;
  year_to: number;
  start_stop: boolean;
  battery_ids: string[];
  validated: boolean;
  popular: boolean;
  notes: string;
}

export interface Vehicle extends VehicleIn {
  id: string;
}

export interface FinderResult {
  vehicle: Vehicle;
  batteries: Battery[];
}

export type QuoteStatus = "novo" | "em_atendimento" | "concluido";

export interface QuoteIn {
  name: string;
  phone: string;
  vehicle: string;
  neighborhood: string;
  need: string;
  message: string;
  vehicle_id: string | null;
  battery_code: string | null;
  source: string;
}

export interface Quote extends QuoteIn {
  id: string;
  status: QuoteStatus;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

// backend/models/store.py
export type DayCode = "Mo" | "Tu" | "We" | "Th" | "Fr" | "Sa" | "Su";

export interface HoursRule {
  days: DayCode[];
  opens: string;
  closes: string;
}

export interface StoreInfo {
  street_address: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  hours: HoursRule[];
  hours_note: string;
}

export interface ImportRowError {
  row: number;
  message: string;
}

export interface ImportReport {
  rows_read: number;
  batteries_created: number;
  batteries_updated: number;
  vehicles_created: number;
  vehicles_updated: number;
  errors: ImportRowError[];
}

export interface ReferenceCleanup {
  batteries_deleted: number;
  vehicles_without_battery: number;
}
