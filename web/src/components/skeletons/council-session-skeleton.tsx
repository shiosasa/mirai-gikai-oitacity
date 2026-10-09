export function CouncilSessionSkeleton() {
  return (
    <section className="w-full bg-mirai-surface-warm px-6 py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center w-full">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="h-8 bg-gray-200 rounded-full w-24"></div>
        </div>
        <div className="text-sm leading-[1.5] text-mirai-text-secondary sm:text-right w-full sm:w-auto">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    </section>
  );
}
