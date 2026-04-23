export default function AdminLoading() {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-32 bg-hatch rounded-md" />
          <div className="h-4 w-40 bg-hatch rounded" />
        </div>
        <div className="h-9 w-36 bg-hatch rounded-md" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border border-border rounded-lg p-4 space-y-2">
            <div className="h-3 w-16 bg-hatch rounded" />
            <div className="h-7 w-10 bg-hatch rounded" />
          </div>
        ))}
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="divide-y divide-border">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="h-4 w-32 bg-hatch rounded" />
              <div className="h-4 w-24 bg-hatch rounded" />
              <div className="h-5 w-16 bg-hatch rounded-full" />
              <div className="h-4 w-20 bg-hatch rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
