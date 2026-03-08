export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FFFFF0]">
      <div className="flex gap-6 px-6 py-6">
        <aside className="w-56 shrink-0 hidden md:block">
          <div className="bg-white rounded-2xl p-5 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded-full animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
            ))}
          </div>
        </aside>
        <main className="flex-1">
          <div className="h-10 bg-gray-200 rounded-2xl animate-pulse mb-4" />
          <div className="h-5 w-40 bg-gray-200 rounded-full animate-pulse mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden">
                <div className="w-full aspect-video bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded-full animate-pulse w-1/3" />
                  <div className="h-4 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded-full animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-200 rounded-full animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}