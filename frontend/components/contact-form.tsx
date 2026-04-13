"use client";

import { useState } from "react";
import { apiClient, ApiClientError } from "@/lib/api-client";
import type { CarType } from "@/lib/types";

type ContactFormProps = {
  locations: string[];
  vehicleTypes: CarType[];
};

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  location: string;
  vehicleType: string;
  message: string;
};

const baseState: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  location: "",
  vehicleType: "",
  message: "",
};

export function ContactForm({ locations, vehicleTypes }: ContactFormProps) {
  const [form, setForm] = useState<ContactFormState>(baseState);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccessId(null);

    try {
      const response = await apiClient.createInquiry({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        location: form.location || undefined,
        vehicleType: form.vehicleType || undefined,
        message: form.message,
      });

      setSuccessId(response.inquiry?.id ?? null);
      setForm(baseState);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Something went wrong while sending your message.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="glass-panel p-5 sm:p-6 md:p-8">
      <div className="space-y-3">
        <p className="section-kicker">Contact RideFlex</p>
        <h2 className="font-[var(--font-display)] text-3xl leading-none tracking-tight text-[#111111] sm:text-4xl md:text-5xl">
          Tell us what kind of car you need.
        </h2>
        <p className="text-sm leading-6 text-[#616161] sm:text-base sm:leading-7">
          Share your trip plans, preferred city, or the type of vehicle you want,
          and our team will get back to you with the right support.
        </p>
      </div>

      {successId ? (
        <div className="mt-6 rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-5 py-5 text-sm text-emerald-800">
          <p className="font-semibold text-emerald-900">Message sent successfully.</p>
          <p className="mt-2 leading-6">
            Our team has your request and will reach out soon.
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-emerald-700">
            Reference {successId.slice(0, 8)}
          </p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:mt-8">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="field-label">Full name</span>
            <div className="mt-2 rounded-[1.2rem] border border-[#dddddd] bg-[#fcfcfc] px-4 py-4 transition focus-within:border-[#d61032] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(214,16,50,0.08)]">
              <input
                required
                name="name"
                autoComplete="name"
                placeholder="Ada Johnson"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                className="field-input"
              />
            </div>
          </label>

          <label className="block">
            <span className="field-label">Email address</span>
            <div className="mt-2 rounded-[1.2rem] border border-[#dddddd] bg-[#fcfcfc] px-4 py-4 transition focus-within:border-[#d61032] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(214,16,50,0.08)]">
              <input
                required
                type="email"
                name="email"
                autoComplete="email"
                placeholder="ada@email.com"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                className="field-input"
              />
            </div>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="field-label">Phone number</span>
            <div className="mt-2 rounded-[1.2rem] border border-[#dddddd] bg-[#fcfcfc] px-4 py-4 transition focus-within:border-[#d61032] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(214,16,50,0.08)]">
              <input
                name="phone"
                autoComplete="tel"
                placeholder="+234 800 123 4567"
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
                className="field-input"
              />
            </div>
          </label>

          <label className="block">
            <span className="field-label">Preferred pickup city</span>
            <div className="mt-2 rounded-[1.2rem] border border-[#dddddd] bg-[#fcfcfc] px-4 py-4 transition focus-within:border-[#d61032] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(214,16,50,0.08)]">
              <select
                name="location"
                value={form.location}
                onChange={(event) =>
                  setForm((current) => ({ ...current, location: event.target.value }))
                }
                className="field-input"
              >
                <option value="">Any city</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </div>

        <label className="block">
          <span className="field-label">Vehicle type</span>
          <div className="mt-2 rounded-[1.2rem] border border-[#dddddd] bg-[#fcfcfc] px-4 py-4 transition focus-within:border-[#d61032] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(214,16,50,0.08)]">
            <select
              name="vehicleType"
              value={form.vehicleType}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  vehicleType: event.target.value,
                }))
              }
              className="field-input"
            >
              <option value="">Any type</option>
              {vehicleTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label className="block">
          <span className="field-label">How can we help?</span>
          <div className="mt-2 rounded-[1.2rem] border border-[#dddddd] bg-[#fcfcfc] px-4 py-4 transition focus-within:border-[#d61032] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(214,16,50,0.08)]">
            <textarea
              required
              name="message"
              rows={5}
              placeholder="Tell us the kind of car you want, your trip dates, your pickup city, or anything else our team should know."
              value={form.message}
              onChange={(event) =>
                setForm((current) => ({ ...current, message: event.target.value }))
              }
              className="field-input min-h-[7.5rem] resize-none"
            />
          </div>
        </label>

        {error ? (
          <p
            aria-live="polite"
            className="rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={pending} className="button-primary w-full">
          {pending ? "Sending message..." : "Send message"}
        </button>
      </form>
    </div>
  );
}
