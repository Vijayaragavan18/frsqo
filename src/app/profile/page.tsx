"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Phone,
  Mail,
  User,
  LogOut,
  Pencil,
  X,
  Check,
  Loader2,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";

import {
  supabase,
  isSupabaseConfigured,
} from "@/lib/supabaseClient";

type Booking = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  service_type: string | null;
  areas: string[] | null;
  preferred_date: string | null;
  preferred_time: string | null;
  address: string | null;
  additional_details: string | null;
  photo_urls: string[] | null;
  status: string | null;
  is_free: boolean | null;
  created_at: string | null;
};

type EditForm = {
  fullName: string;
  phone: string;
  email: string;
  preferredDate: string;
  preferredTime: string;
  address: string;
  additionalDetails: string;
};

const formatDate = (date: string | null) => {
  if (!date) return "Not specified";

  try {
    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  } catch {
    return date;
  }
};

const formatTime = (time: string | null) => {
  if (!time) return "Not specified";

  const [hours, minutes] = time.split(":");

  if (!hours || !minutes) return time;

  const hour = Number(hours);

  if (Number.isNaN(hour)) return time;

  const suffix = hour >= 12 ? "PM" : "AM";
  const formattedHour =
    hour % 12 === 0 ? 12 : hour % 12;

  return `${formattedHour}:${minutes} ${suffix}`;
};

const formatService = (service: string | null) => {
  const names: Record<string, string> = {
    organise: "Organise",
    organise_clean: "Organise + Clean",
    organise_clean_transform:
      "Organise + Clean + Transform",
    complete_home_reset: "Complete Home Reset",
  };

  return service ? names[service] || service : "Service";
};

const getStatusClass = (status: string | null) => {
  switch (status) {
    case "confirmed":
      return "bg-green-50 text-green-700";

    case "completed":
      return "bg-blue-50 text-blue-700";

    case "cancelled":
      return "bg-red-50 text-red-600";

    default:
      return "bg-amber-50 text-amber-700";
  }
};

const formatStatus = (status: string | null) => {
  if (!status) return "Pending";

  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  );
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] =
    useState<Awaited<
      ReturnType<
        NonNullable<typeof supabase>["auth"]["getUser"]
      >
    >["data"]["user"]>(null);

  const [bookings, setBookings] = useState<Booking[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] =
    useState(true);

  const [error, setError] = useState<string | null>(
    null
  );

  const [editingBooking, setEditingBooking] =
    useState<Booking | null>(null);

  const [savingBooking, setSavingBooking] =
    useState(false);

  const [saveError, setSaveError] =
    useState<string | null>(null);

  const [saveSuccess, setSaveSuccess] =
    useState(false);

  const [editForm, setEditForm] =
    useState<EditForm>({
      fullName: "",
      phone: "",
      email: "",
      preferredDate: "",
      preferredTime: "",
      address: "",
      additionalDetails: "",
    });

  const [profileName, setProfileName] =
    useState("");

  const [profilePhone, setProfilePhone] =
    useState("");

  const [profileEmail, setProfileEmail] =
    useState("");

  const [editingProfile, setEditingProfile] =
    useState(false);

  const [savingProfile, setSavingProfile] =
    useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        setBookingLoading(false);
        return;
      }

      const client = supabase;

      const {
        data: { user },
        error: userError,
      } = await client.auth.getUser();

      if (userError || !user) {
        router.push("/login?next=/profile");
        return;
      }

      setUser(user);

      const metadata = user.user_metadata ?? {};

      const name =
        metadata.full_name ||
        metadata.name ||
        "";

      const phone =
        user.phone ||
        metadata.phone ||
        "";

      const email = user.email || "";

      setProfileName(name);
      setProfilePhone(phone);
      setProfileEmail(email);

      setLoading(false);

      const {
        data: bookingData,
        error: bookingError,
      } = await client
        .from("bookings")
        .select(`
          id,
          full_name,
          phone,
          email,
          service_type,
          areas,
          preferred_date,
          preferred_time,
          address,
          additional_details,
          photo_urls,
          status,
          is_free,
          created_at
        `)
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (bookingError) {
        console.error(
          "Booking loading error:",
          bookingError
        );

        setError(
          "Unable to load your bookings."
        );
      } else {
        setBookings(
          (bookingData as Booking[]) || []
        );
      }

      setBookingLoading(false);
    };

    loadProfile();
  }, [router]);

  const openEditModal = (booking: Booking) => {
    setEditingBooking(booking);

    setEditForm({
      fullName: booking.full_name || "",
      phone: booking.phone || "",
      email: booking.email || "",
      preferredDate:
        booking.preferred_date || "",
      preferredTime:
        booking.preferred_time || "",
      address: booking.address || "",
      additionalDetails:
        booking.additional_details || "",
    });

    setSaveError(null);
    setSaveSuccess(false);
  };

  const closeEditModal = () => {
    if (savingBooking) return;

    setEditingBooking(null);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const saveBooking = async () => {
    if (!editingBooking) return;

    if (
      !editForm.fullName.trim() ||
      !editForm.phone.trim() ||
      !editForm.email.trim() ||
      !editForm.preferredDate ||
      !editForm.preferredTime ||
      !editForm.address.trim()
    ) {
      setSaveError(
        "Please fill in all required fields."
      );
      return;
    }

    if (!supabase) {
      setSaveError(
        "Supabase is not configured."
      );
      return;
    }

    setSavingBooking(true);
    setSaveError(null);
    setSaveSuccess(false);

    const { data, error } = await supabase
      .from("bookings")
      .update({
        full_name: editForm.fullName.trim(),
        phone: editForm.phone.trim(),
        email: editForm.email.trim(),
        preferred_date:
          editForm.preferredDate,
        preferred_time:
          editForm.preferredTime,
        address: editForm.address.trim(),
        additional_details:
          editForm.additionalDetails.trim() ||
          null,
      })
      .eq("id", editingBooking.id)
      .eq("user_id", user?.id)
      .select(`
        id,
        full_name,
        phone,
        email,
        service_type,
        areas,
        preferred_date,
        preferred_time,
        address,
        additional_details,
        photo_urls,
        status,
        is_free,
        created_at
      `)
      .single();

    if (error) {
      console.error(
        "Booking update error:",
        error
      );

      setSaveError(
        "Unable to update this booking. Please try again."
      );

      setSavingBooking(false);
      return;
    }

    if (data) {
      setBookings((current) =>
        current.map((booking) =>
          booking.id === editingBooking.id
            ? (data as Booking)
            : booking
        )
      );
    }

    setSaveSuccess(true);
    setSavingBooking(false);

    setTimeout(() => {
      setEditingBooking(null);
      setSaveSuccess(false);
    }, 900);
  };

  const saveProfile = async () => {
    if (!supabase || !user) return;

    setSavingProfile(true);

    const { error } =
      await supabase.auth.updateUser({
        data: {
          full_name: profileName.trim(),
          phone: profilePhone.trim(),
        },
      });

    if (error) {
      console.error(
        "Profile update error:",
        error
      );
    } else {
      setEditingProfile(false);
    }

    setSavingProfile(false);
  };

  const logout = async () => {
    if (!supabase) return;

    await supabase.auth.signOut();

    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="container-froska py-16">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-center py-20">
              <Loader2
                className="animate-spin text-green-600"
                size={22}
              />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <main className="min-h-screen bg-cream">
        <div className="container-froska py-10 md:py-14">
          <div className="mx-auto max-w-4xl">

            {/* PROFILE HEADER */}
            <section className="rounded-2xl border border-line bg-white px-5 py-5 shadow-card sm:px-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

               <div className="flex items-center gap-3.5">
  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">
    <User size={19} />
  </div>

  <div className="min-w-0">
    <p className="text-[11px] font-medium uppercase tracking-wider text-ink/40">
      My profile
    </p>

    <h1 className="mt-0.5 truncate font-display text-xl font-semibold text-ink">
      {profileName ||
        user.email?.split("@")[0] ||
        "Profile"}
    </h1>

    <p className="mt-0.5 truncate text-xs text-ink/50">
      {profileEmail}
    </p>

    {profilePhone && (
      <p className="mt-0.5 truncate text-xs text-ink/50">
        {profilePhone}
      </p>
    )}
  </div>
</div>

                <div className="flex items-center gap-2">
                  {!editingProfile && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingProfile(true)
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink/70 transition-colors hover:border-green-300 hover:text-green-700"
                    >
                      <Pencil size={13} />
                      Edit profile
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-ink/50 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut size={13} />
                    Logout
                  </button>
                </div>
              </div>

              {editingProfile && (
                <div className="mt-5 border-t border-line pt-5">
                  <div className="grid gap-4 sm:grid-cols-2">

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-ink/70">
                        Name
                      </label>

                      <input
                        value={profileName}
                        onChange={(e) =>
                          setProfileName(
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-ink/70">
                        Phone
                      </label>

                      <input
                        value={profilePhone}
                        onChange={(e) =>
                          setProfilePhone(
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-green-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-medium text-ink/70">
                        Email
                      </label>

                      <input
                        value={profileEmail}
                        readOnly
                        className="w-full rounded-xl border border-line bg-gray-50 px-3.5 py-2.5 text-sm text-ink/50 outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingProfile(false)
                      }
                      className="rounded-lg px-3 py-2 text-xs font-medium text-ink/60 hover:bg-gray-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={saveProfile}
                      disabled={savingProfile}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {savingProfile && (
                        <Loader2
                          size={13}
                          className="animate-spin"
                        />
                      )}
                      Save
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* BOOKINGS */}
            <section className="mt-8">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-green-600">
                    Your bookings
                  </p>

                  <h2 className="mt-1 font-display text-xl font-semibold text-ink">
                    Booking details
                  </h2>
                </div>

                <NextLink
                  href="/book"
                  className="text-xs font-semibold text-green-700 hover:text-green-800"
                >
                  + New booking
                </NextLink>
              </div>

              {bookingLoading ? (
                <div className="flex items-center justify-center rounded-2xl border border-line bg-white py-14">
                  <Loader2
                    size={20}
                    className="animate-spin text-green-600"
                  />
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-5">
                  <p className="text-sm text-red-600">
                    {error}
                  </p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="rounded-2xl border border-line bg-white px-6 py-12 text-center shadow-card">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-green-600">
                    <CalendarDays size={19} />
                  </div>

                  <h3 className="mt-4 text-base font-semibold text-ink">
                    No bookings yet
                  </h3>

                  <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-ink/50">
                    Your bookings will appear here once
                    you book a frsqo service.
                  </p>

                  <NextLink
                    href="/book"
                    className="mt-5 inline-flex rounded-lg bg-green-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-green-700"
                  >
                    Book a slot
                  </NextLink>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map(
                    (booking, index) => (
                      <article
                        key={booking.id}
                        className="overflow-hidden rounded-2xl border border-line bg-white shadow-card"
                      >
                        {/* BOOKING HEADER */}
                        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-700">
                              {index + 1}
                            </div>

                            <div className="min-w-0">
                              <p className="text-[10px] font-medium uppercase tracking-wider text-ink/40">
                                Booking #{index + 1}
                              </p>

                              <h3 className="mt-0.5 truncate text-sm font-semibold text-ink">
                                {formatService(
                                  booking.service_type
                                )}
                              </h3>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusClass(
                                booking.status
                              )}`}
                            >
                              {formatStatus(
                                booking.status
                              )}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  booking
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[11px] font-medium text-ink/60 transition-colors hover:border-green-300 hover:text-green-700"
                            >
                              <Pencil size={12} />
                              Edit
                            </button>
                          </div>
                        </div>

                        {/* FREE OFFER */}
                        {booking.is_free && (
                          <div className="mx-5 mt-4 flex items-center gap-3 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-lime-50 px-4 py-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                              <Sparkles size={14} />
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-emerald-900">
                                Launch offer applied
                              </p>

                              <p className="mt-0.5 text-[11px] text-emerald-800/65">
                                No payment required for
                                this booking.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* DETAILS */}
                        <div className="grid gap-x-6 gap-y-4 px-5 py-5 sm:grid-cols-2">

                          <BookingDetail
                            icon={
                              <CalendarDays
                                size={15}
                              />
                            }
                            label="Date"
                            value={formatDate(
                              booking.preferred_date
                            )}
                          />

                          <BookingDetail
                            icon={
                              <Clock3 size={15} />
                            }
                            label="Time"
                            value={formatTime(
                              booking.preferred_time
                            )}
                          />

                          <BookingDetail
                            icon={
                              <MapPin size={15} />
                            }
                            label="Areas"
                            value={
                              booking.areas?.length
                                ? booking.areas.join(
                                    ", "
                                  )
                                : "Not specified"
                            }
                          />

                          <BookingDetail
                            icon={
                              <User size={15} />
                            }
                            label="Name"
                            value={
                              booking.full_name ||
                              "Not specified"
                            }
                          />

                          <BookingDetail
                            icon={
                              <Phone size={15} />
                            }
                            label="Phone"
                            value={
                              booking.phone ||
                              "Not specified"
                            }
                          />

                          <BookingDetail
                            icon={
                              <Mail size={15} />
                            }
                            label="Email"
                            value={
                              booking.email ||
                              "Not specified"
                            }
                          />

                          <div className="sm:col-span-2">
                            <BookingDetail
                              icon={
                                <MapPin
                                  size={15}
                                />
                              }
                              label="Address"
                              value={
                                booking.address ||
                                "Not specified"
                              }
                            />
                          </div>

                          {booking.additional_details && (
                            <div className="sm:col-span-2">
                              <BookingDetail
                                icon={
                                  <Check
                                    size={15}
                                  />
                                }
                                label="Additional details"
                                value={
                                  booking.additional_details
                                }
                              />
                            </div>
                          )}
                        </div>

                        {/* PHOTOS */}
                        {booking.photo_urls &&
                          booking.photo_urls.length >
                            0 && (
                            <div className="border-t border-line px-5 py-4">
                              <div className="mb-3 flex items-center gap-2">
                                <ImageIcon
                                  size={14}
                                  className="text-ink/40"
                                />

                                <p className="text-xs font-medium text-ink/70">
                                  Uploaded photos
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {booking.photo_urls.map(
                                  (url, photoIndex) => (
                                    <a
                                      key={`${url}-${photoIndex}`}
                                      href={url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="block overflow-hidden rounded-lg border border-line"
                                    >
                                      <img
                                        src={url}
                                        alt={`Booking photo ${
                                          photoIndex + 1
                                        }`}
                                        className="h-16 w-16 object-cover transition-transform hover:scale-105"
                                      />
                                    </a>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* BOOKING ID */}
                        <div className="border-t border-line bg-gray-50/60 px-5 py-2.5">
                          <p className="truncate text-[10px] text-ink/35">
                            Booking ID:{" "}
                            {booking.id}
                          </p>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* EDIT BOOKING MODAL */}
      {editingBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeEditModal();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-green-600">
                  Booking #{bookings.findIndex(
                    (b) =>
                      b.id === editingBooking.id
                  ) + 1}
                </p>

                <h2 className="mt-1 text-base font-semibold text-ink">
                  Edit booking
                </h2>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={savingBooking}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 hover:bg-gray-50 hover:text-ink disabled:opacity-50"
              >
                <X size={17} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="max-h-[calc(90vh-150px)] overflow-y-auto px-5 py-5">
              <div className="grid gap-4 sm:grid-cols-2">

                <EditField
                  label="Full Name"
                  value={editForm.fullName}
                  onChange={(value) =>
                    setEditForm((form) => ({
                      ...form,
                      fullName: value,
                    }))
                  }
                  required
                />

                <EditField
                  label="Phone"
                  type="tel"
                  value={editForm.phone}
                  onChange={(value) =>
                    setEditForm((form) => ({
                      ...form,
                      phone: value,
                    }))
                  }
                  required
                />

                <EditField
                  label="Email"
                  type="email"
                  value={editForm.email}
                  onChange={(value) =>
                    setEditForm((form) => ({
                      ...form,
                      email: value,
                    }))
                  }
                  required
                  className="sm:col-span-2"
                />

                <EditField
                  label="Preferred Date"
                  type="date"
                  value={editForm.preferredDate}
                  onChange={(value) =>
                    setEditForm((form) => ({
                      ...form,
                      preferredDate: value,
                    }))
                  }
                  required
                />

                <EditField
                  label="Preferred Time"
                  type="time"
                  value={editForm.preferredTime}
                  onChange={(value) =>
                    setEditForm((form) => ({
                      ...form,
                      preferredTime: value,
                    }))
                  }
                  required
                />

                <EditField
                  label="Address"
                  value={editForm.address}
                  onChange={(value) =>
                    setEditForm((form) => ({
                      ...form,
                      address: value,
                    }))
                  }
                  placeholder="E.g. Flat 204, Koramangala, Bangalore"
                  required
                  className="sm:col-span-2"
                />

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-medium text-ink/70">
                    Additional Details
                  </label>

                  <textarea
                    rows={3}
                    value={
                      editForm.additionalDetails
                    }
                    onChange={(e) =>
                      setEditForm((form) => ({
                        ...form,
                        additionalDetails:
                          e.target.value,
                      }))
                    }
                    placeholder="E.g. 2BHK, kitchen needs organising, lots of clothes..."
                    className="w-full resize-none rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-green-500"
                  />
                </div>
              </div>

              {saveError && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3">
                  <p className="text-xs leading-5 text-red-600">
                    {saveError}
                  </p>
                </div>
              )}

              {saveSuccess && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-xs font-medium text-green-700">
                  <Check size={14} />
                  Booking updated successfully.
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="flex items-center justify-end gap-2 border-t border-line bg-gray-50/50 px-5 py-4">
              <button
                type="button"
                onClick={closeEditModal}
                disabled={savingBooking}
                className="rounded-lg px-4 py-2.5 text-xs font-medium text-ink/60 hover:bg-white disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveBooking}
                disabled={savingBooking}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingBooking ? (
                  <>
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    Save changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function BookingDetail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-ink/40">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-1 text-sm leading-5 text-ink/80 break-words">
        {value}
      </p>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  className = "",
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium text-ink/70">
        {label}
      </label>

      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-green-500"
      />
    </div>
  );
}