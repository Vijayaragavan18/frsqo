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

import {
  supabase,
  isSupabaseConfigured,
} from "@/lib/supabaseClient";

import { BOOKING_AREAS, SERVICE_LEVELS } from "@/lib/constants";
import {
  submitBooking,
  uploadBookingPhoto,
} from "@/lib/bookings";

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

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

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
   * ---------------------------------------------------------
   * CHECK LOGIN
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const checkAuth = async () => {
      if (!isSupabaseConfigured || !supabase) {
        window.location.replace(
          `/login?next=${encodeURIComponent("/book")}`
        );
        return;
      }

      const client = supabase;

      const {
        data: { user },
        error: authError,
      } = await client.auth.getUser();

      if (authError || !user) {
        window.location.replace(
          `/login?next=${encodeURIComponent("/book")}`
        );
        return;
      }

      /*
       * Get user metadata
       */
      const metadata = user.user_metadata ?? {};

      const fullName =
        metadata.full_name ||
        metadata.name ||
        "";

      const phone =
        user.phone ||
        metadata.phone ||
        "";

      const email =
        user.email ||
        "";

      /*
       * Prefill logged-in user's details
       */
      setForm((current) => ({
        ...current,
        fullName: current.fullName || fullName,
        phone: current.phone || phone,
        email: current.email || email,
      }));

      setAuthenticated(true);
      setCheckingAuth(false);
    };

    checkAuth();
  }, []);

  /*
   * ---------------------------------------------------------
   * STEP VALIDATION
   * ---------------------------------------------------------
   */

  const canProceed =
    (step === 0 && form.service !== null) ||
    (step === 1 && form.areas.length > 0) ||
    step === 2;

  /*
   * ---------------------------------------------------------
   * AREA SELECT
   * ---------------------------------------------------------
   */

  const toggleArea = (area: BookingArea) => {
    setForm((current) => ({
      ...current,
      areas: current.areas.includes(area)
        ? current.areas.filter((item) => item !== area)
        : [...current.areas, area],
    }));
  };

  /*
   * ---------------------------------------------------------
   * SUBMIT BOOKING
   * ---------------------------------------------------------
   */

  const onSubmit = async () => {
    if (!form.service) {
      return;
    }

    /*
     * Double-check authentication before submitting.
     * This prevents an unauthenticated booking even if the
     * user somehow reaches this button.
     */

    if (!isSupabaseConfigured || !supabase) {
      window.location.replace(
        `/login?next=${encodeURIComponent("/book")}`
      );
      return;
    }

    const client = supabase;

    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser();

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
       * Upload photos first
       */
      const photoUrls: string[] = [];

      for (const file of form.photos) {
        const url = await uploadBookingPhoto(file);

        if (url) {
          photoUrls.push(url);
        }
      }

      /*
       * Submit booking
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
          form.additionalDetails.trim() || undefined,

        photo_urls: photoUrls,
      });

      if (!response.success) {
        setError(
          response.error ||
            "Something went wrong. Please try again."
        );

        return;
      }

      /*
       * Booking successfully created
       */
      setResult({
        isFree: Boolean(response.isFree),
      });
    } catch (error) {
      console.error("Booking submission error:", error);

      setError(
        "Something went wrong while submitting your booking. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * AUTH CHECK LOADING
   * ---------------------------------------------------------
   */

  if (checkingAuth || !authenticated) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2
          size={24}
          className="animate-spin text-green-700"
        />
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * BOOKING SUCCESS
   * ---------------------------------------------------------
   */

  if (result) {
    return (
      <BookingConfirmation
        isFree={result.isFree}
      />
    );
  }

  /*
   * ---------------------------------------------------------
   * MAIN BOOKING FLOW
   * ---------------------------------------------------------
   */

  return (
    <div className="mx-auto w-full max-w-2xl">

      {/* Progress */}
      <div className="mb-10 flex items-center justify-center gap-3">
        {STEP_LABELS.map((label, index) => (
          <div
            key={label}
            className="flex items-center gap-3"
          >
            <div className="flex items-center gap-2">

              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  index < step
                    ? "bg-green-600 text-white"
                    : index === step
                    ? "bg-green-600 text-white"
                    : "bg-line text-ink/40"
                }`}
              >
                {index < step ? (
                  <Check size={13} />
                ) : (
                  index + 1
                )}
              </span>

              <span
                className={`text-sm font-medium ${
                  index <= step
                    ? "text-ink"
                    : "text-ink/40"
                }`}
              >
                {label}
              </span>
            </div>

            {index < STEP_LABELS.length - 1 && (
              <span className="h-px w-8 bg-line" />
            )}
          </div>
        ))}
      </div>

      {/* Animated step content */}
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

          {/* STEP 1 — SERVICE */}
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

          {/* STEP 2 — AREAS */}
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
                    onClick={() => toggleArea(area)}
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

          {/* STEP 3 — DETAILS */}
          {step === 2 && (
            <StepBlock title="Tell us how to reach you">

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

                {/* Preferred Date */}
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

                {/* Preferred Time */}
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
                  required
                  placeholder="E.g. 123 Main St, Apt 4B, Bangalore"
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
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-green-500"
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
                <p className="mt-4 text-sm text-red-600">
                  {error}
                </p>
              )}
            </StepBlock>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
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
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
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
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
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
 * ---------------------------------------------------------
 * STEP BLOCK
 * ---------------------------------------------------------
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
 * ---------------------------------------------------------
 * SELECT CARD
 * ---------------------------------------------------------
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
 * ---------------------------------------------------------
 * TEXT FIELD
 * ---------------------------------------------------------
 */

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
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
 * ---------------------------------------------------------
 * PHOTO UPLOAD
 * ---------------------------------------------------------
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
          onChange={(event) => {
            const selectedFiles = Array.from(
              event.target.files ?? []
            );

            onChange([
              ...files,
              ...selectedFiles,
            ]);

            /*
             * Reset input so the same file can be
             * selected again if needed.
             */
            event.target.value = "";
          }}
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
 * ---------------------------------------------------------
 * BOOKING CONFIRMATION
 * ---------------------------------------------------------
 */

function BookingConfirmation({
  isFree,
}: {
  isFree: boolean;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
      className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl2 border border-line bg-white px-8 py-14 text-center shadow-card"
    >

      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
        <PartyPopper size={26} />
      </span>

      <h2 className="font-display text-2xl font-bold text-ink">
        Booking confirmed
      </h2>

      {isFree ? (
        <p className="text-sm leading-relaxed text-ink/60">
          Your booking is currently eligible for our
          launch offer — this visit is on us. We&rsquo;ll
          be in touch shortly to confirm the details.
        </p>
      ) : (
        <p className="text-sm leading-relaxed text-ink/60">
          Thanks — we&rsquo;ve received your booking. Our
          team will reach out shortly to confirm the
          details and next steps.
        </p>
      )}

    </motion.div>
  );
}