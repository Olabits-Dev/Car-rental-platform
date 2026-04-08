import Form from "next/form";
import Link from "next/link";
import type { CarFilters, CarType } from "@/lib/types";

type FilterFormProps = {
  initialFilters: CarFilters;
  locations: string[];
  types: CarType[];
};

export function FilterForm({
  initialFilters,
  locations,
  types,
}: FilterFormProps) {
  return (
    <div className="glass-panel p-5 md:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-kicker">Find your ride</p>
          <h2 className="mt-2 font-[var(--font-display)] text-3xl leading-none text-[#111111] md:text-4xl">
            Filter by city, vehicle type, and budget
          </h2>
        </div>
        <Link
          href="/cars"
          className="w-full rounded-[0.9rem] border border-[#d8d8d8] px-4 py-2 text-center text-sm font-semibold text-[#222222] transition hover:border-[#d61032] hover:text-[#d61032] sm:w-auto"
        >
          Reset filters
        </Link>
      </div>

      <Form action="/cars" scroll={false} className="grid gap-4 lg:grid-cols-4">
        <label className="field-shell">
          <span className="field-label">Search</span>
          <input
            name="query"
            placeholder="SUV, Toyota, Lagos..."
            defaultValue={initialFilters.query}
            className="field-input"
          />
        </label>

        <label className="field-shell">
          <span className="field-label">Location</span>
          <select
            name="location"
            defaultValue={initialFilters.location ?? ""}
            className="field-input"
          >
            <option value="">All locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>

        <label className="field-shell">
          <span className="field-label">Type</span>
          <select
            name="type"
            defaultValue={initialFilters.type ?? ""}
            className="field-input"
          >
            <option value="">All types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="field-shell">
            <span className="field-label">Max price/day</span>
            <input
              type="number"
              min={20000}
              step={5000}
              name="maxPrice"
              defaultValue={initialFilters.maxPrice}
              placeholder="Any budget"
              className="field-input"
            />
          </label>
          <button type="submit" className="button-primary self-end">
            Show
          </button>
        </div>
      </Form>
    </div>
  );
}
