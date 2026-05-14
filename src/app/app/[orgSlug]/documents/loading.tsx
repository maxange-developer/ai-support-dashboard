export default function DocumentsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-28 bg-white/[0.04] rounded" />
        <div className="h-9 w-36 bg-white/[0.04]" />
      </div>

      <div className="border divide-y">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="h-4 w-4 bg-white/[0.04] rounded shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-48 bg-white/[0.04] rounded" />
              <div className="h-3 w-24 bg-white/[0.04] rounded" />
            </div>
            <div className="h-5 w-16 bg-white/[0.04] rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
