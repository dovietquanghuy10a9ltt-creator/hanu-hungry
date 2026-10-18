export default function RootLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-32 rounded-md bg-gray-200" />
        <div className="h-9 w-64 rounded-lg bg-gray-200" />
      </div>
      <div className="card p-6 space-y-4">
        <div className="h-6 w-1/3 rounded-md bg-gray-200" />
        <div className="h-4 w-2/3 rounded-md bg-gray-200" />
        <div className="h-28 w-full rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}
