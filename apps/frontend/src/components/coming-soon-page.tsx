"use client"

export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <svg
          className="h-8 w-8 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        هذه الصفحة قيد التطوير — قريبًا ستتوفر بالكامل ضمن نظام قَوام.
      </p>
    </div>
  )
}
