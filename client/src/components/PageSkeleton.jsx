function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
}

export default function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading workspace">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <SkeletonBlock className="h-6 w-40" />
          <SkeletonBlock className="h-9 w-9 rounded-full" />
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-3">
            <SkeletonBlock className="h-3 w-32" />
            <SkeletonBlock className="h-10 w-72 max-w-full" />
            <SkeletonBlock className="h-4 w-96 max-w-full" />
          </div>
          <SkeletonBlock className="h-11 w-32" />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <SkeletonBlock className="h-3 w-20" />
                <SkeletonBlock className="h-8 w-8 rounded-lg" />
              </div>
              <SkeletonBlock className="mt-4 h-8 w-12" />
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
            <SkeletonBlock className="h-11 flex-1" />
            <SkeletonBlock className="h-11 w-28" />
            <SkeletonBlock className="h-11 w-32" />
          </div>
          <div className="border-b border-slate-100 px-5 py-4">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="mt-2 h-3 w-40" />
          </div>
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
              <div className="w-full space-y-3">
                <div className="flex gap-2">
                  <SkeletonBlock className="h-5 w-12" />
                  <SkeletonBlock className="h-5 w-14" />
                </div>
                <SkeletonBlock className="h-4 w-3/4 max-w-md" />
                <SkeletonBlock className="h-3 w-32" />
              </div>
              <SkeletonBlock className="h-7 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
