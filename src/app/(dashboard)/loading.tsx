import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="space-y-8 p-4 lg:p-6">
      <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-card rounded-xl animate-pulse border" />
        ))}
      </div>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-card rounded-xl animate-pulse border" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-72 bg-card rounded-xl animate-pulse border" />
            ))}
          </div>
          <div className="h-64 bg-card rounded-xl animate-pulse border" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 bg-card rounded-xl animate-pulse border" />
          ))}
        </div>
      </div>
    </div>
  )
}
