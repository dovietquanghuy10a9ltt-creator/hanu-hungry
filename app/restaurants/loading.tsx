export default function RestaurantsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <header className="page-intro">
        <div>
          <div className="h-4 w-32 rounded-md bg-gray-200" />
          <div className="mt-3 h-10 w-64 rounded-lg bg-gray-200" />
          <div className="mt-3 h-5 w-96 max-w-full rounded-md bg-gray-200" />
        </div>
      </header>

      {/* Search & filter bars placeholder */}
      <div className="space-y-4">
        <div className="h-12 w-full rounded-2xl bg-gray-200" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-9 w-24 rounded-full bg-gray-200" />
          ))}
        </div>
      </div>

      {/* Grid of 6 restaurant cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card overflow-hidden">
            <div className="aspect-[16/10] bg-gray-200" />
            <div className="p-5 space-y-3">
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded-full bg-gray-200" />
                <div className="h-5 w-20 rounded-full bg-gray-200" />
              </div>
              <div className="h-6 w-3/4 rounded-lg bg-gray-200" />
              <div className="h-4 w-1/2 rounded-md bg-gray-200" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-5 w-24 rounded-md bg-gray-200" />
                <div className="h-8 w-20 rounded-xl bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
