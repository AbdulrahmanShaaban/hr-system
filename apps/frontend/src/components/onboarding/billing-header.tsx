import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

type BillingHeaderProps = {
  backHref: string
  className?: string
}

export function BillingHeader({ backHref, className }: BillingHeaderProps) {
  return (
    <div className={cn("mb-8 flex items-center gap-3", className)}>
      <Link
        href={backHref}
        className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted"
      >
        <ArrowRight className="size-4" />
      </Link>
      <div>
        <p className="text-xs text-muted-foreground">قوام</p>
        <p className="text-sm font-medium text-foreground">إعداد الشركة</p>
      </div>
    </div>
  )
}
