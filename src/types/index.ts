export type ServiceType =
  | "organise"
  | "organise_clean"
  | "organise_clean_transform"
  | "complete_home_reset";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type BookingArea =
  | "Hall / Living Room"
  | "Kitchen"
  | "Bedroom"
  | "Wardrobe"
  | "Bathroom"
  | "Kids Room"
  | "Walls / Shelves"
  | "Storage"
  | "Entire Home"
  | "Other";

export interface BookingRecord {
  id?: string;
  full_name: string;
  phone: string;
  email: string;
  service_type: ServiceType;
  areas: BookingArea[];
  preferred_date: string;
  preferred_time: string;
  address: string;
  additional_details?: string;
  photo_urls?: string[];
  status?: BookingStatus;
  is_free?: boolean;
  created_at?: string;
}
