import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type OnboardingFooterProps = {
  onBack?: () => void
  onNext?: () => void
  onSkip?: () => void
  nextLabel?: string
  backLabel?: string
  skipLabel?: string
  nextDisabled?: boolean
  nextPending?: boolean
  nextType?: "button" | "submit"
  className?: string
}

export function OnboardingFooter({
  onBack,
  onNext,
  onSkip,
  nextLabel = "متابعة",
  backLabel = "السابق",
  skipLabel = "تخطي",
  nextDisabled = false,
  nextPending = false,
  nextType = "button",
  className,
}: OnboardingFooterProps) {
  return (
    <div
      className={cn(
        "mt-8 flex items-center justify-between gap-3 border-t border-border pt-6",
        className,
      )}
    >
      {onBack ? (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="h-11 rounded-[6px] px-8 font-semibold"
        >
          {backLabel}
        </Button>
      ) : (
        <span aria-hidden />
      )}

      <div className="flex items-center gap-4">
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {skipLabel}
          </button>
        )}
        <Button
          type={nextType}
          onClick={nextType === "button" ? onNext : undefined}
          disabled={nextDisabled || nextPending}
          className="h-11 rounded-[6px] bg-primary px-8 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {nextPending ? "جارٍ الحفظ…" : nextLabel}
        </Button>
      </div>
    </div>
  )
}
