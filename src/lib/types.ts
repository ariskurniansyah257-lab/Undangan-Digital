import type { EventType, OrderStatus } from "./constants";

export type Role = "client" | "admin" | "sub_admin";

export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: Role;
  created_at: string;
}

export interface Package {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  price: number;
  discount_price: number | null;
  currency: string;
  max_guests: number;
  max_gallery: number;
  max_events: number;
  max_banks: number;
  allow_video: boolean;
  allow_auto_slide: boolean;
  allow_motion: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface PackageFeature {
  id: string;
  package_id: string;
  label: string;
  value: string | null;
  included: boolean;
  sort_order: number;
}

export interface Theme {
  id: string;
  package_id: string | null;
  slug: string;
  name: string;
  description: string | null;
  preview_image: string | null;
  demo_url: string | null;
  config: Record<string, unknown>;
  is_active: boolean;
  sort_order: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string | null;
  url: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  price: number;
  package_id: string | null;
  theme_id: string | null;
  is_active: boolean;
}

export interface BankAdmin {
  id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  logo: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Order {
  id: string;
  user_id: string;
  invoice_no: string;
  status: OrderStatus;
  total: number;
  payment_bank_id: string | null;
  payment_proof_url: string | null;
  paid_at: string | null;
  note: string | null;
  created_at: string;
}

export interface Invitation {
  id: string;
  user_id: string;
  package_id: string | null;
  theme_id: string | null;
  song_id: string | null;
  order_id: string | null;
  event_type: EventType;
  slug: string;
  title: string;
  status: "draft" | "published";
  quote_mode: "ayat" | "custom";
  quote_text: string | null;
  quote_source: string | null;
  photo_mode: "gabung" | "pisah" | "tiga";
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Guest {
  id: string;
  invitation_id: string;
  name: string;
  slug: string;
  category: string | null;
  is_opened: boolean;
}
