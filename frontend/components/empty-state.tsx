import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
};

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div className="glass-panel flex flex-col items-start gap-4 rounded-[1.8rem] p-8">
      <span className="rounded-full bg-[#fff0f3] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#d61032]">
        No results yet
      </span>
      <div className="space-y-3">
        <h3 className="font-[var(--font-display)] text-3xl leading-none text-[#111111] md:text-4xl">
          {title}
        </h3>
        <p className="max-w-2xl text-base leading-7 text-[#616161]">
          {description}
        </p>
      </div>
      <Link href={actionHref} className="button-primary">
        {actionLabel}
      </Link>
    </div>
  );
}
