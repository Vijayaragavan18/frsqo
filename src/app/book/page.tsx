"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  PartyPopper,
  X,
} from "lucide-react";

import { BOOKING_AREAS, SERVICE_LEVELS } from "@/lib/constants";
import {
  submitBooking,
  uploadBookingPhoto,
} from "@/lib/bookings";

import {
  supabase,
  isSupabaseConfigured,
} from "@/lib/supabaseClient";

import type {
  BookingArea,
  ServiceType,
} from "@/types";

const STEP_LABELS = ["Service", "Areas", "Details"];

interface FormState {
  service: ServiceType | null;
  areas: BookingArea[];
  fullName: string;
  phone: string;
  email: string;
  preferredDate: string;
  preferredTime: string;
  address: string;
  additionalDetails: string;
  photos: File[];
}

export default function BookingFlow() {
  const params = useSearchParams();

  const initialService =
    params.get("service") as ServiceType | null;

  const initialArea =
    params.get("area") as BookingArea | null;

  const [step, setStep] = useState(0);

  const [submitting, setSubmitting] = useState(false);

  /*
   * IMPORTANT:
   *
   * checkingAuth = we are still checking Supabase
   * authenticated = user has been confirmed as logged in
   */
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const [result, setResult] = useState<{
    isFree: boolean;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    service: SERVICE_LEVELS.some(
      (s) => s.id === initialService
    )
      ? initialService
      : null,

    areas:
      initialArea &&
      BOOKING_AREAS.includes(initialArea)
        ? [initialArea]
        : [],

    fullName: "",
    phone: "",
    email: "",
    preferredDate: "",
    preferredTime: "",
    address: "",
    additionalDetails: "",
    photos: [],
  });

  /*
   * =========================================================
   * AUTHENTICATION CHECK
   * =========================================================
   *
   * This runs as soon as /book loads.
   *
   * If the user is NOT logged in:
   *
   * /book
   *   ↓
   * /login?next=/book
   *
   * If the user IS logged in:
   *
   * /book
   *   ↓
   * booking page
   */
  useEffect(() => {
    let mounted = true;

    const checkAuthentication = async () => {
      /*
       * Supabase isn't configured.
       * Don't allow access to booking.
       */
      if (!isSupabaseConfigured || !supabase) {
        window.location.replace(
          `/login?next=${encodeURIComponent("/book")}`
        );
        return;
      }

      const client = supabase;

      try {
        const {
          data: { user },
          error: authError,
        } = await client.auth.getUser();

        /*
         * NO USER = NOT LOGGED IN
         *
         * This is the important part.
         */
        if (authError || !user) {
          window.location.replace(
            `/login?next=${encodeURIComponent("/book")}`
          );

          return;
        }

        /*
         * User is logged in.
         */

        if (!mounted) {
          return;
        }

        const metadata = user.user_metadata ?? {};

        const name =
          metadata.full_name ||
          metadata.name ||
          "";

        const email =
          user.email ||
          "";

        const phone =
          user.phone ||
          metadata.phone ||
          "";

        /*
         * Prefill account information.
         */
        setForm((current) => ({
          ...current,

          fullName:
            current.fullName || name,

          email:
            current.email || email,

          phone:
            current.phone || phone,
        }));

        setAuthenticated(true);
        setCheckingAuth(false);
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error
        );

        /*
         * If authentication check itself fails,
         * don't allow access to /book.
         */
        window.location.replace(
          `/login?next=${encodeURIComponent("/book")}`
        );
      }
    };

    checkAuthentication();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * =========================================================
   * STEP VALIDATION
   * =========================================================
   */

  const canProceed =
    (step === 0 && form.service !== null) ||
    (step === 1 && form.areas.length > 0) ||
    step === 2;

  /*
   * =========================================================
   * AREA SELECTION
   * =========================================================
   */

  const toggleArea = (area: BookingArea) => {
    setForm((current) => ({
      ...current,

      areas: current.areas.includes(area)
        ? current.areas.filter(
            (item) => item !== area
          )
        : [...current.areas, area],
    }));
  };

  /*
   * =========================================================
   * SUBMIT BOOKING
   * =========================================================
   *
   * We check authentication AGAIN here.
   *
   * So even if somebody somehow gets past the first
   * check, they still cannot submit a booking without
   * being logged in.
   */
  const onSubmit = async () => {
    if (!form.service) {
      return;
    }

    /*
     * Supabase unavailable
     */
    if (!isSupabaseConfigured || !supabase) {
      window.location.replace(
        `/login?next=${encodeURIComponent("/book")}`
      );

      return;
    }

    const client = supabase;

    /*
     * Check current logged-in user again.
     */
    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser();

    /*
     * NOT LOGGED IN
     */
    if (authError || !user) {
      window.location.replace(
        `/login?next=${encodeURIComponent("/book")}`
      );

      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      /*
       * Upload photos first.
       */
      const photoUrls: string[] = [];

      for (const file of form.photos) {
        const url = await uploadBookingPhoto(file);

        if (url) {
          photoUrls.push(url);
        }
      }

      /*
       * Submit booking.
       *
       * submitBooking() will attach the authenticated
       * user's user_id before inserting into Supabase.
       */
      const response = await submitBooking({
        full_name: form.fullName.trim(),

        phone: form.phone.trim(),

        email: form.email.trim(),

        service_type: form.service,

        areas: form.areas,

        preferred_date: form.preferredDate,

        preferred_time: form.preferredTime,

        address: form.address.trim(),

        additional_details:
          form.additionalDetails.trim() ||
          undefined,

        photo_urls: photoUrls,
      });

      /*
       * Booking failed.
       */
      if (!response.success) {
        setError(
          response.error ||
            "Something went wrong. Please try again."
        );

        return;
      }

      /*
       * Booking succeeded.
       */
      setResult({
        isFree: Boolean(response.isFree),
      });
    } catch (error) {
      console.error(
        "Booking submission error:",
        error
      );

      setError(
        "Something went wrong while submitting your booking. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * =========================================================
   * IMPORTANT:
   *
   * While authentication is being checked, DO NOT render
   * the booking form.
   *
   * If authentication fails, the user is redirected before
   * this screen can be used.
   * =========================================================
   */

  if (checkingAuth || !authenticated) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-ink/50">
          <Loader2
            size={20}
            className="animate-spin text-green-600"
          />

          Checking your account...
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * BOOKING SUCCESS
   * =========================================================
   */

  if (result) {
    return (
      <BookingConfirmation
        isFree={result.isFree}
      />
    );
  }

  /*
   * =========================================================
   * BOOKING FORM
   * =========================================================
   */

  return (
    <div className="mx-auto w-full max-w-2xl">

      {/* Steps */}
      <div className="mb-10 flex items-center justify-center gap-3">
        {STEP_LABELS.map((label, i) => (
          <div
            key={label}
            className="flex items-center gap-3"
          >
            <div className="flex items-center gap-2">

              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  i < step
                    ? "bg-green-600 text-white"
                    : i === step
                    ? "bg-green-600 text-white"
                    : "bg-line text-ink/40"
                }`}
              >
                {i < step ? (
                  <Check size={13} />
                ) : (
                  i + 1
                )}
              </span>

              <span
                className={`text-sm font-medium ${
                  i <= step
                    ? "text-ink"
                    : "text-ink/40"
                }`}
              >
                {label}
              </span>

            </div>

            {i < STEP_LABELS.length - 1 && (
              <span className="h-px w-8 bg-line" />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">

        <motion.div
          key={step}
          initial={{
            opacity: 0,
            x: 16,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          exit={{
            opacity: 0,
            x: -16,
          }}
          transition={{
            duration: 0.25,
            ease: [0.22, 1, 0.36, 1],
          }}
        >

          {/* =================================================
              STEP 1 — SERVICE
              ================================================= */}

          {step === 0 && (
            <StepBlock title="What do you need?">

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {SERVICE_LEVELS.map((level) => (
                  <SelectCard
                    key={level.id}
                    selected={
                      form.service === level.id
                    }
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        service: level.id,
                      }))
                    }
                  >

                    <h3 className="font-display text-sm font-semibold text-ink">
                      {level.name}
                    </h3>

                    <p className="mt-1.5 text-xs leading-relaxed text-ink/55">
                      {level.description}
                    </p>

                  </SelectCard>
                ))}

              </div>

            </StepBlock>
          )}

          {/* =================================================
              STEP 2 — AREAS
              ================================================= */}

          {step === 1 && (
            <StepBlock
              title="What needs attention?"
              hint="Select all that apply."
            >

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                {BOOKING_AREAS.map((area) => (
                  <SelectCard
                    key={area}
                    selected={form.areas.includes(area)}
                    onClick={() =>
                      toggleArea(area)
                    }
                    compact
                  >

                    <span className="text-sm font-medium text-ink">
                      {area}
                    </span>

                  </SelectCard>
                ))}

              </div>

            </StepBlock>
          )}

          {/* =================================================
              STEP 3 — DETAILS
              ================================================= */}

          {step === 2 && (
            <StepBlock
              title="Tell us how to reach you"
            >

              <div className="mb-5 rounded-xl bg-green-50 px-4 py-3">
                <p className="text-xs leading-relaxed text-green-700">
                  Your account details have been
                  filled in automatically. You can
                  edit them before confirming your
                  booking.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* Full Name */}
                <TextField
                  label="Full Name"
                  value={form.fullName}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      fullName: value,
                    }))
                  }
                  required
                  placeholder="Your full name"
                />

                {/* Phone */}
                <TextField
                  label="Phone Number"
                  type="tel"
                  value={form.phone}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      phone: value,
                    }))
                  }
                  required
                  placeholder="Your phone number"
                />

                {/* Email */}
                <TextField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      email: value,
                    }))
                  }
                  required
                  placeholder="you@example.com"
                  className="sm:col-span-2"
                />

                {/* Date */}
                <TextField
                  label="Preferred Date"
                  type="date"
                  value={form.preferredDate}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      preferredDate: value,
                    }))
                  }
                  required
                />

                {/* Time */}
                <TextField
                  label="Preferred Time"
                  type="time"
                  value={form.preferredTime}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      preferredTime: value,
                    }))
                  }
                  required
                />

                {/* Address */}
                <TextField
                  label="Address"
                  value={form.address}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      address: value,
                    }))
                  }
                  placeholder="E.g. 123 Main St, Apt 4B, Springfield"
                  required
                  className="sm:col-span-2"
                />

              </div>

              {/* Additional Details */}
              <div className="mt-4">

                <label className="mb-1.5 block text-sm font-medium text-ink/80">
                  Additional Details
                </label>

                <textarea
                  rows={3}
                  value={form.additionalDetails}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      additionalDetails:
                        event.target.value,
                    }))
                  }
                  placeholder="E.g. 2BHK, kitchen needs organising, lots of clothes..."
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-green-500"
                />

              </div>

              {/* Photos */}
              <PhotoUpload
                files={form.photos}
                onChange={(files) =>
                  setForm((current) => ({
                    ...current,
                    photos: files,
                  }))
                }
              />

              {/* Error */}
              {error && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3">
                  <p className="text-sm leading-5 text-red-600">
                    {error}
                  </p>
                </div>
              )}

            </StepBlock>
          )}

        </motion.div>

      </AnimatePresence>

      {/* =====================================================
          NAVIGATION
          ===================================================== */}

      <div className="mt-10 flex items-center justify-between">

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            setStep((current) =>
              Math.max(0, current - 1)
            )
          }
          className={`inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink ${
            step === 0 ? "invisible" : ""
          }`}
        >
          <ChevronLeft size={16} />
          Back
        </button>

        {/* Continue */}
        {step < 2 ? (
          <button
            type="button"
            disabled={!canProceed}
            onClick={() =>
              setStep((current) =>
                Math.min(2, current + 1)
              )
            }
            className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
            <ChevronRight size={16} />
          </button>
        ) : (

          /* Confirm Booking */
          <button
            type="button"
            disabled={
              submitting ||
              !form.fullName.trim() ||
              !form.phone.trim() ||
              !form.email.trim() ||
              !form.preferredDate ||
              !form.preferredTime ||
              !form.address.trim()
            }
            onClick={onSubmit}
            className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting && (
              <Loader2
                className="animate-spin"
                size={16}
              />
            )}

            {submitting
              ? "Submitting..."
              : "Confirm Booking"}
          </button>
        )}

      </div>
    </div>
  );
}

/*
 * =========================================================
 * STEP BLOCK
 * =========================================================
 */

function StepBlock({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>

      <h2 className="font-display text-xl font-semibold text-ink">
        {title}
      </h2>

      {hint && (
        <p className="mt-1 text-sm text-ink/50">
          {hint}
        </p>
      )}

      <div className="mt-6">
        {children}
      </div>

    </div>
  );
}

/*
 * =========================================================
 * SELECT CARD
 * =========================================================
 */

function SelectCard({
  selected,
  onClick,
  children,
  compact = false,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border text-left transition-all duration-200 ${
        compact
          ? "px-4 py-3.5"
          : "p-5"
      } ${
        selected
          ? "border-green-600 bg-green-50 shadow-soft"
          : "border-line bg-white hover:border-green-300"
      }`}
    >

      <div className="flex items-start justify-between gap-2">

        <div className="flex-1">
          {children}
        </div>

        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            selected
              ? "border-green-600 bg-green-600 text-white"
              : "border-line text-transparent"
          }`}
        >
          <Check size={12} />
        </span>

      </div>

    </button>
  );
}

/*
 * =========================================================
 * TEXT FIELD
 * =========================================================
 */

function TextField({
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

      <label className="mb-1.5 block text-sm font-medium text-ink/80">
        {label}
      </label>

      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-green-500"
      />

    </div>
  );
}

/*
 * =========================================================
 * PHOTO UPLOAD
 * =========================================================
 */

function PhotoUpload({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  return (
    <div className="mt-5">

      <label className="mb-1.5 block text-sm font-medium text-ink/80">
        Upload Photos{" "}
        <span className="font-normal text-ink/40">
          (optional)
        </span>
      </label>

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-white px-4 py-6 text-sm text-ink/50 transition-colors hover:border-green-400 hover:text-green-700">

        <ImagePlus size={18} />

        Add photos of the space

        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) =>
            onChange([
              ...files,
              ...Array.from(
                event.target.files ?? []
              ),
            ])
          }
        />

      </label>

      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">

          {files.map((file, index) => (
            <span
              key={`${file.name}-${index}`}
              className="flex items-center gap-1.5 rounded-full bg-green-50 py-1 pl-3 pr-1 text-xs text-green-800"
            >

              {file.name}

              <button
                type="button"
                onClick={() =>
                  onChange(
                    files.filter(
                      (_, fileIndex) =>
                        fileIndex !== index
                    )
                  )
                }
                className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-green-100"
              >
                <X size={10} />
              </button>

            </span>
          ))}

        </div>
      )}

    </div>
  );
}

/*
 * =========================================================
 * BOOKING CONFIRMATION
 * =========================================================
 */

function BookingConfirmation({
  isFree,
}: {
  isFree: boolean;
}) {
  return (
    <motion.div
  initial={{ opacity: 0, scale: 0.96, y: 16 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  transition={{ duration: 0.55, ease: "easeOut" }}
  className="relative mx-auto w-full max-w-lg overflow-hidden rounded-[2rem] border border-emerald-100 bg-white px-6 py-10 text-center shadow-[0_20px_60px_-20px_rgba(16,185,129,0.22)] sm:px-10 sm:py-12"
>
  {/* soft background glow */}
  <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-green-100/60 blur-3xl" />
  <div className="pointer-events-none absolute -bottom-20 -right-16 h-48 w-48 rounded-full bg-lime-100/50 blur-3xl" />

  <div className="relative">
    {/* success icon */}
    <motion.div
      initial={{ scale: 0.7, rotate: -8 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        delay: 0.15,
        duration: 0.45,
        type: "spring",
        stiffness: 180,
      }}
      className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200"
    >
      <PartyPopper size={28} strokeWidth={1.8} />
    </motion.div>

    <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-green-600">
      You&rsquo;re all set
    </p>

    <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
      Booking confirmed
    </h2>

    {isFree ? (
      <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 px-5 py-4">
        <div className="flex items-center justify-center gap-2">
          <span className="text-base">✨</span>
          <p className="text-sm font-semibold text-green-800">
            This one&rsquo;s on us
          </p>
        </div>

        <p className="mt-1.5 text-xs leading-5 text-green-800/65">
          Your booking is covered by our launch offer.
          No payment is required.
        </p>
      </div>
    ) : (
      <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-ink/55">
        Thanks for booking with us. We&rsquo;ll reach out shortly to confirm
        your details and the next steps.
      </p>
    )}

    <div className="mx-auto mt-7 flex max-w-xs items-center justify-center gap-2 text-xs text-ink/40">
      <span className="h-px flex-1 bg-line" />
      <span>We&rsquo;ll be in touch soon</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  </div>
</motion.div>
  );
}