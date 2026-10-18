export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-7 animate-pulse">
      <div>
        <div className="h-4 w-28 rounded-md bg-gray-200" />
        <div className="mt-2 h-9 w-48 rounded-lg bg-gray-200" />
      </div>

      <div className="card grid gap-6 p-5 sm:p-7 md:grid-cols-[1fr_1.3fr]">
        <div className="flex flex-col items-center sm:items-start space-y-4">
          <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-gray-200" />
          <div className="space-y-2 w-full flex flex-col items-center sm:items-start">
            <div className="h-7 w-44 rounded-lg bg-gray-200" />
            <div className="h-4 w-52 rounded-md bg-gray-200" />
            <div className="h-4 w-32 rounded-md bg-gray-200" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-24 rounded-md bg-gray-200" />
            <div className="h-11 w-full rounded-xl bg-gray-200" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 rounded-md bg-gray-200" />
            <div className="h-11 w-full rounded-xl bg-gray-200" />
          </div>
          <div className="pt-2">
            <div className="h-11 w-44 rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-4 space-y-2">
            <div className="h-8 w-16 rounded-lg bg-gray-200" />
            <div className="h-3.5 w-20 rounded-md bg-gray-200" />
          </div>
        ))}
      </div>

      <div className="card flex flex-wrap gap-3 p-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-28 rounded-xl bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
