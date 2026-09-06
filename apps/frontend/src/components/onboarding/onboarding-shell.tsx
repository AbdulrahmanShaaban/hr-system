import { cn } from "@/lib/utils"

export const ONBOARDING_TOTAL_STEPS = 10

export const ONBOARDING_STEP_PERCENT: Record<number, number> = {
  1: 5,
  2: 15,
  3: 25,
  4: 35,
  5: 50,
  6: 60,
  7: 70,
  8: 80,
  9: 90,
  10: 100,
}

type OnboardingShellProps = {
  step: number
  percent?: number
  children: React.ReactNode
  className?: string
}

export function OnboardingShell({
  step,
  percent,
  children,
  className,
}: OnboardingShellProps) {
  const value = percent ?? ONBOARDING_STEP_PERCENT[step] ?? 0

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[792px] rounded-2xl bg-card p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-10",
        className,
      )}
    >
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-foreground">
            الخطوة {step} من {ONBOARDING_TOTAL_STEPS}
          </span>
          <span className="font-bold text-primary">{value}% مكتمل</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${value}%` }}
          />
        </div>
      </div>

      {children}
    </div>
  )
}
