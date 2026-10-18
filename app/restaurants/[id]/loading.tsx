export default function RestaurantDetailLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-4 w-28 rounded-md bg-gray-200" />
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,.85fr)]">
        <div className="relative min-h-56 sm:min-h-80 rounded-xl bg-gray-200" />
        <div className="card space-y-5 p-5 sm:p-7">
          <div className="flex gap-2">
            <div className="h-6 w-24 rounded-full bg-gray-200" />
            <div className="h-6 w-20 rounded-full bg-gray-200" />
          </div>
          <div>
            <div className="h-4 w-32 rounded-md bg-gray-200" />
            <div className="mt-2 h-10 w-3/4 rounded-lg bg-gray-200" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-1/2 rounded-md bg-gray-200" />
            <div className="h-4 w-2/3 rounded-md bg-gray-200" />
            <div className="h-4 w-1/3 rounded-md bg-gray-200" />
          </div>
          <div className="h-11 w-full rounded-xl bg-gray-200" />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,.7fr)]">
        <div className="space-y-4">
          <div>
            <div className="h-4 w-20 rounded-md bg-gray-200" />
            <div className="mt-2 h-8 w-40 rounded-lg bg-gray-200" />
          </div>
          <div className="card divide-y divide-gray-100 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 sm:p-5 gap-3">
                <div className="h-14 w-14 rounded-xl bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-1/3 rounded-md bg-gray-200" />
                  <div className="h-3.5 w-1/4 rounded-md bg-gray-200" />
                </div>
                <div className="h-5 w-20 rounded-md bg-gray-200" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="h-4 w-28 rounded-md bg-gray-200" />
            <div className="mt-2 h-8 w-36 rounded-lg bg-gray-200" />
          </div>
          <div className="card p-6 space-y-3">
            <div className="h-4 w-full rounded-md bg-gray-200" />
            <div className="h-4 w-3/4 rounded-md bg-gray-200" />
          </div>
        </div>
      </section>
    </div>
  );
}
