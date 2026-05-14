export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-32 bg-white/[0.04] rounded" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-white/10 bg-white/[0.02] p-4 space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-28 bg-white/[0.04] rounded" />
              <div className="h-4 w-4 bg-white/[0.04] rounded" />
            </div>
            <div className="h-7 w-20 bg-white/[0.04] rounded" />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="h-5 w-40 bg-white/[0.04] rounded" />
        <div className="h-44 border border-white/10 bg-white/[0.02]" />
      </div>

      <div className="space-y-3">
        <div className="h-5 w-44 bg-white/[0.04] rounded" />
        <div className="border divide-y">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5">
              <div className="h-4 w-4 bg-white/[0.04] rounded" />
              <div className="h-4 flex-1 bg-white/[0.04] rounded" />
              <div className="h-4 w-6 bg-white/[0.04] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
