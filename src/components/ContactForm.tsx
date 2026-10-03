"use client";

import { useState } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setStatus("loading");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Contact form error:", data);
        setStatus("error");
        return;
      }

      setStatus("sent");
    } catch (error) {
      console.error("Contact form error:", error);
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="card-surface flex flex-col items-center gap-3 px-6 py-12 text-center">
        <CheckCircle2 className="text-green-600" size={32} />

        <h3 className="font-display text-lg font-semibold text-ink">
          Message sent
        </h3>

        <p className="max-w-xs text-sm text-ink/60">
          Thanks, {form.name.split(" ")[0] || "there"}. We&rsquo;ll get back to
          you shortly.
        </p>

        <button
          type="button"
          onClick={() => {
            setForm({
              name: "",
              email: "",
              phone: "",
              message: "",
            });
            setStatus("idle");
          }}
          className="mt-2 text-sm font-medium text-green-600 hover:text-green-700"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="card-surface flex flex-col gap-5 p-6 sm:p-8"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="Name"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          required
        />

        <Field
          label="Phone"
          type="tel"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
        />
      </div>

      <Field
        label="Email"
        type="email"
        value={form.email}
        onChange={(v) => setForm({ ...form, email: v })}
        required
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink/80">
          Message
        </label>

        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) =>
            setForm({
              ...form,
              message: e.target.value,
            })
          }
          placeholder="Tell us what you need..."
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-green-500"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">
          Something went wrong while sending your message. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary mt-1 w-full sm:w-fit"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Sending...
          </>
        ) : (
          <>
            <Send size={16} />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink/80">
        {label}
      </label>

      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-green-500"
      />
    </div>
  );
}