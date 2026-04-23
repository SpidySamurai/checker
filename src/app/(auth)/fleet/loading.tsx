export default function FleetLoading() {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-32 bg-hatch rounded-md" />
          <div className="h-4 w-24 bg-hatch rounded-md" />
        </div>
        <div className="h-8 w-24 bg-hatch rounded-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="border border-border rounded-lg p-4 space-y-2">
            <div className="h-3 w-20 bg-hatch rounded" />
            <div className="h-7 w-16 bg-hatch rounded" />
            <div className="h-3 w-24 bg-hatch rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 md:gap-6">
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <div className="h-4 w-24 bg-hatch rounded" />
          </div>
          <div className="divide-y divide-border">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <div className="h-8 w-8 rounded-full bg-hatch shrink-0" />
                <div className="h-4 w-32 bg-hatch rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <div className="h-4 w-20 bg-hatch rounded" />
          </div>
          <div className="p-3 space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-9 bg-hatch rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
