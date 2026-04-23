export default function ReportsLoading() {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-pulse">
      <div className="space-y-1">
        <div className="h-7 w-28 bg-hatch rounded-md" />
        <div className="h-4 w-36 bg-hatch rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="border border-border rounded-lg p-4 space-y-2">
            <div className="h-3 w-20 bg-hatch rounded" />
            <div className="h-7 w-24 bg-hatch rounded" />
            <div className="h-3 w-16 bg-hatch rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 md:gap-6">
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <div className="h-4 w-40 bg-hatch rounded" />
          </div>
          <div className="divide-y divide-border">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="h-7 w-7 rounded-full bg-hatch" />
                <div className="flex-1 h-4 bg-hatch rounded" />
                <div className="h-4 w-8 bg-hatch rounded" />
                <div className="h-4 w-20 bg-hatch rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <div className="h-4 w-32 bg-hatch rounded" />
          </div>
          <div className="p-4 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-20 bg-hatch rounded" />
                <div className="h-1.5 bg-hatch rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
