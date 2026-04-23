export default function DriversLoading() {
  return (
    <div className="p-4 md:p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-32 bg-hatch rounded-md" />
        <div className="h-9 w-36 bg-hatch rounded-md" />
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="divide-y divide-border">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="h-9 w-9 rounded-full bg-hatch shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-36 bg-hatch rounded" />
                <div className="h-3 w-24 bg-hatch rounded" />
              </div>
              <div className="h-6 w-16 bg-hatch rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
