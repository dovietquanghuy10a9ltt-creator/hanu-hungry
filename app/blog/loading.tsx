export default function BlogLoading() {
  return (
    <div className="space-y-7 animate-pulse">
      <div>
        <div className="h-4 w-24 rounded-md bg-gray-200" />
        <div className="mt-2 h-9 w-56 rounded-lg bg-gray-200" />
        <div className="mt-2 h-4 w-80 max-w-full rounded-md bg-gray-200" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card overflow-hidden">
            <div className="aspect-[16/10] bg-gray-200" />
            <div className="space-y-3 p-5">
              <div className="h-6 w-5/6 rounded-lg bg-gray-200" />
              <div className="space-y-1.5">
                <div className="h-4 w-full rounded-md bg-gray-200" />
                <div className="h-4 w-2/3 rounded-md bg-gray-200" />
              </div>
              <div className="h-4 w-20 rounded-md bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
