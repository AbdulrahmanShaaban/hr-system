"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="mt-4 text-xl font-bold text-foreground">
          حدث خطأ
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          يرجى المحاولة مرة أخرى.
        </p>
        <Button onClick={reset} className="mt-6">
          إعادة المحاولة
        </Button>
      </div>
    </div>
  )
}
