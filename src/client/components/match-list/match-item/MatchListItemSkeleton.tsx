export const MatchListItemSkeleton = () => {
  return (
    <div className="flex items-center gap-3 font-mono p-2 border-dashed animate-pulse">
      {/* Win/Loss indicator skeleton */}
      <div className="w-fit shrink-0">
        <div className="px-2 py-1 rounded-md bg-gray-300 dark:bg-gray-700 w-8 h-6" />
      </div>

      {/* Champion section skeleton */}
      <div className="w-48 shrink-0 flex items-center gap-2.5">
        {/* Champion icon skeleton */}
        <div className="w-8 h-8 rounded-md bg-gray-300 dark:bg-gray-700" />
        {/* Champion name skeleton */}
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20" />
      </div>

      {/* KDA skeleton */}
      <div className="w-24 shrink-0 flex justify-center">
        <div className="flex gap-1 items-center">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3" />
          <span className="text-gray-400">/</span>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3" />
          <span className="text-gray-400">/</span>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3" />
        </div>
      </div>

      {/* Items skeleton */}
      <div className="flex-1 min-w-0 flex items-center gap-1">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="w-6 h-6 rounded-md bg-gray-300 dark:bg-gray-700" />
        ))}
      </div>

      {/* Game duration skeleton */}
      <div className="text-right">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-12" />
      </div>
    </div>
  );
};
