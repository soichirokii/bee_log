export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FFFFF0] px-[5vw] md:px-6 py-[4vw] md:py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[#FFFFF0] overflow-hidden">
            <div className="w-full aspect-video bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-3 bg-gray-200 rounded-full w-1/3 animate-pulse" />
              <div className="h-5 bg-gray-200 rounded-full w-full animate-pulse" />
              <div className="h-5 bg-gray-200 rounded-full w-2/3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
