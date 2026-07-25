import { Spinner, Skeleton } from '../atoms/Spinner'

export function PageLoading() {
  return (
    <div className="flex justify-center py-20" aria-busy="true" aria-live="polite">
      <Spinner />
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}
