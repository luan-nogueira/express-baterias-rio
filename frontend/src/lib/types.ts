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
