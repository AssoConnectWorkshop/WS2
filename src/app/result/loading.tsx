export default function ResultLoading() {
  return (
    <main className="min-h-screen flex flex-col items-center gap-8 p-8 bg-gradient-to-b from-indigo-50 to-purple-50">
      <h1 className="text-3xl font-bold text-indigo-800">Résultats du vote</h1>
      <div className="flex flex-col gap-6 w-full max-w-xl animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-200 flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-indigo-200 rounded" />
                <div className="h-4 w-16 bg-indigo-100 rounded" />
              </div>
              <div className="w-full h-5 bg-indigo-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-indigo-200" style={{ width: `${70 - i * 20}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
