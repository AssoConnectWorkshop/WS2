export default function VoteLoading() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-6 bg-gradient-to-b from-indigo-50 to-purple-50">
      <h1 className="text-2xl font-bold text-indigo-800">Élection du Président</h1>
      <div className="flex flex-col items-center gap-6 animate-pulse">
        <div className="h-6 w-40 bg-indigo-200 rounded-full" />
        <div className="w-72 h-72 rounded-2xl bg-indigo-100" />
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-20 h-10 bg-indigo-200 rounded-xl" />
          ))}
        </div>
      </div>
    </main>
  );
}
