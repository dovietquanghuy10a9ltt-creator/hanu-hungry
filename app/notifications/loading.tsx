export default function NotificationsLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-pulse">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="h-4 w-32 rounded-md bg-gray-200" />
          <div className="mt-2 h-9 w-44 rounded-lg bg-gray-200" />
          <div className="mt-2 h-4 w-36 rounded-md bg-gray-200" />
        </div>
        <div className="h-9 w-36 rounded-xl bg-gray-200" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="h-6 w-2/3 rounded-lg bg-gray-200" />
              <div className="h-5 w-12 rounded-full bg-gray-200" />
            </div>
            <div className="space-y-1.5">
              <div className="h-4 w-full rounded-md bg-gray-200" />
              <div className="h-4 w-3/4 rounded-md bg-gray-200" />
            </div>
            <div className="h-3 w-28 rounded-md bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
