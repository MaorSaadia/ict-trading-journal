import { Skeleton } from '@/components/ui/skeleton'

export function TradesSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[40px_120px_80px_80px_100px_100px_60px_80px_120px_140px_80px] gap-2 px-4 py-2 bg-muted/50">
        {Array.from({ length: 11 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[40px_120px_80px_80px_100px_100px_60px_80px_120px_140px_80px] gap-2 px-4 py-3 border-t"
        >
          {Array.from({ length: 11 }).map((_, j) => (
            <Skeleton key={j} className="h-6 w-full" />
          ))}
        </div>
      ))}
    </div>
  )
}