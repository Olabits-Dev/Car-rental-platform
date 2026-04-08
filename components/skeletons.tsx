function SkeletonBlock({ className }: { className: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function ListingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <div className="glass-panel p-6">
        <SkeletonBlock className="h-6 w-28 rounded-full" />
        <SkeletonBlock className="mt-4 h-12 w-3/5 rounded-2xl" />
        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-14 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-[2rem] border border-white/70 bg-white/80 p-5">
            <SkeletonBlock className="h-52 rounded-[1.6rem]" />
            <SkeletonBlock className="mt-5 h-8 w-2/3 rounded-2xl" />
            <SkeletonBlock className="mt-3 h-4 w-full rounded-full" />
            <SkeletonBlock className="mt-2 h-4 w-5/6 rounded-full" />
            <div className="mt-5 grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, nestedIndex) => (
                <SkeletonBlock
                  key={nestedIndex}
                  className="h-16 rounded-2xl"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,420px)]">
        <div className="glass-panel p-8">
          <SkeletonBlock className="h-7 w-24 rounded-full" />
          <SkeletonBlock className="mt-5 h-16 w-3/5 rounded-3xl" />
          <SkeletonBlock className="mt-4 h-5 w-full rounded-full" />
          <SkeletonBlock className="mt-2 h-5 w-4/5 rounded-full" />
          <SkeletonBlock className="mt-8 h-72 rounded-[2rem]" />
        </div>
        <div className="glass-panel p-8">
          <SkeletonBlock className="h-10 w-2/3 rounded-2xl" />
          <SkeletonBlock className="mt-5 h-14 rounded-2xl" />
          <SkeletonBlock className="mt-4 h-14 rounded-2xl" />
          <SkeletonBlock className="mt-6 h-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <div className="glass-panel p-8">
        <SkeletonBlock className="h-7 w-32 rounded-full" />
        <SkeletonBlock className="mt-5 h-16 w-1/2 rounded-3xl" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-28 rounded-[1.6rem]" />
          ))}
        </div>
      </div>
      <div className="mt-8 grid gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="glass-panel p-6">
            <SkeletonBlock className="h-8 w-1/3 rounded-2xl" />
            <SkeletonBlock className="mt-4 h-5 w-full rounded-full" />
            <SkeletonBlock className="mt-2 h-5 w-4/5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
