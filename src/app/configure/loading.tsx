export default function ConfigureLoading() {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-indigo-50 to-purple-50">
      <div className="max-w-2xl mx-auto flex flex-col gap-8 animate-pulse">
        <div className="h-8 w-56 bg-indigo-200 rounded-full" />
        <div className="flex flex-col gap-3">
          <div className="h-5 w-40 bg-indigo-100 rounded" />
          <div className="flex gap-3 flex-wrap">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-24 h-24 bg-indigo-200 rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="h-px bg-indigo-100" />
        <div className="flex flex-col gap-3">
          <div className="h-5 w-48 bg-indigo-100 rounded" />
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-indigo-200 flex-shrink-0" />
                <div className="flex-1 h-4 bg-indigo-100 rounded" />
                <div className="w-8 h-8 bg-indigo-100 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
