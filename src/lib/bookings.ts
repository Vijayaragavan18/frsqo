import { supabase, isSupabaseConfigured } from "./supabaseClient";
import type { BookingRecord } from "@/types";
import { LAUNCH_OFFER } from "./constants";

export interface LaunchOfferStatus {
  claimed: number;
  total: number;
  remaining: number;
}

/**
 * Reads the live "first 20 free" counter.
 */
export async function getLaunchOfferStatus(): Promise<LaunchOfferStatus> {
  const fallback: LaunchOfferStatus = {
    claimed: 7,
    total: LAUNCH_OFFER.total,
    remaining: Math.max(LAUNCH_OFFER.total - 7, 0),
  };

  if (!isSupabaseConfigured || !supabase) {
    return fallback;
  }

  const client = supabase;

  const { data, error } = await client
    .rpc("get_launch_offer_status")
    .maybeSingle<LaunchOfferStatus>();

  if (error || !data) {
    console.error("Launch offer error:", error);
    return fallback;
  }

  return data;
}

export interface SubmitBookingResult {
  success: boolean;
  isFree?: boolean;
  error?: string;
}

/**
 * Inserts a booking.
 *
 * Logged-in users:
 *   user_id = their Supabase auth user ID
 *
 * Guests:
 *   user_id = null
 *
 * is_free and status are NOT sent.
 * They are decided server-side by the database trigger.
 */
export async function submitBooking(
  booking: Omit<
    BookingRecord,
    "id" | "is_free" | "status" | "created_at"
  >
): Promise<SubmitBookingResult> {
  if (!isSupabaseConfigured || !supabase) {
    console.info(
      "[frsqo] Supabase not configured — booking not persisted:",
      booking
    );

    return {
      success: true,
      isFree: true,
    };
  }

  const client = supabase;

  /*
   * Get the currently logged-in user.
   *
   * If there is no user, this returns null.
   * That is okay because guests are allowed to book.
   */
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError) {
    console.error("Unable to get current user:", userError);
  }

  /*
   * Add user_id only when somebody is logged in.
   *
   * Guest bookings will use null.
   */
  const bookingToInsert = {
    ...booking,
    user_id: user?.id ?? null,
  };

  const { data, error } = await client
    .from("bookings")
    .insert(bookingToInsert)
    .select("is_free")
    .single();

  if (error) {
    console.error("Booking insert error:", error);

    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    isFree: data?.is_free ?? false,
  };
}

/**
 * Upload a booking photo to Supabase Storage.
 */
export async function uploadBookingPhoto(
  file: File
): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const client = supabase;

  /*
   * Make the filename safer for Storage.
   */
  const safeName = file.name.replace(
    /[^a-zA-Z0-9._-]/g,
    "-"
  );

  const path = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;

  const { error } = await client.storage
    .from("booking-photos")
    .upload(path, file);

  if (error) {
    console.error("Photo upload error:", error);
    return null;
  }

  const { data } = client.storage
    .from("booking-photos")
    .getPublicUrl(path);

  return data.publicUrl;
}