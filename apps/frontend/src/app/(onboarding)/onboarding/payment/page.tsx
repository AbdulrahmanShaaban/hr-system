"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { toast } from "sonner"

import { BillingHeader } from "@/components/onboarding/billing-header"
import { Button } from "@/components/ui/button"
import { advanceOnboardingTo } from "@/lib/onboarding/advance"
import {
  clearLastSubscription,
  getLastSubscription,
  getSelectedPlan,
  setLastSubscription,
  setLocalOnboardingStep,
  type SubscriptionResultDraft,
} from "@/lib/onboarding/draft"
import {
  PLAN_UI_CONFIG,
  SUPPORT_MAILTO,
  formatSar,
  priceForCycle,
} from "@/lib/onboarding/plans-ui"

type View = "form" | "success" | "failed"

function labelForPlanName(name: string | undefined): string {
  const idx = PLAN_UI_CONFIG.findIndex(
    (p) => p.nameHint.toLowerCase() === (name ?? "").toLowerCase(),
  )
  if (idx >= 0) return PLAN_UI_CONFIG[idx]!.label
  return name ?? "الباقة"
}

export default function OnboardingPaymentPage() {
  const router = useRouter()
  const selected = getSelectedPlan()
  const [view, setView] = React.useState<View>("form")
  const [result, setResult] = React.useState<SubscriptionResultDraft | null>(null)
  const [pending, setPending] = React.useState(false)

  React.useEffect(() => {
    if (!selected?.planId) {
      router.replace("/onboarding/pricing")
      return
    }
    setLocalOnboardingStep("payment")
    const last = getLastSubscription()
    if (last?.view === "success" || last?.view === "failed") {
      setResult(last)
      setView(last.view)
    }
  }, [router, selected?.planId])

  async function startCompanySetup() {
    setPending(true)
    try {
      clearLastSubscription()
      await advanceOnboardingTo("attendance")
      router.push("/onboarding/attendance")
    } catch {
      toast.error("تعذر المتابعة إلى الإعداد")
    } finally {
      setPending(false)
    }
  }

  if (!selected?.planId) {
    return (
      <div className="mx-auto flex max-w-md items-center justify-center p-10 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  if (view === "success" && result) {
    return (
      <div className="mx-auto w-full max-w-xl px-2 sm:px-4">
        <BillingHeader backHref="/onboarding/pricing" />
        <div className="rounded-2xl bg-card p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-10">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="size-10 text-primary" />
          </div>
          <h1 className="mt-5 text-2xl font-bold">تم تفعيل الاشتراك بنجاح</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            يمكنك الآن متابعة إعداد شركتك على منصة قوام
          </p>
          <Button
            type="button"
            className="mt-8 h-11 w-full"
            disabled={pending}
            onClick={() => void startCompanySetup()}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "ابدأ إعداد شركتك"
            )}
          </Button>
        </div>
      </div>
    )
  }

  if (view === "failed") {
    return (
      <div className="mx-auto w-full max-w-xl px-2 sm:px-4">
        <BillingHeader backHref="/onboarding/pricing" />
        <div className="rounded-2xl bg-card p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-10">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="size-10 text-destructive" />
          </div>
          <h1 className="mt-5 text-2xl font-bold">فشلت عملية الدفع</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {result?.errorMessage ?? "لم نتمكن من إتمام عملية الدفع. يرجى المحاولة مجددًا."}
          </p>
          <Button
            type="button"
            className="mt-8 h-11 w-full"
            onClick={() => {
              clearLastSubscription()
              setResult(null)
              setView("form")
            }}
          >
            إعادة محاولة الدفع
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-xl px-2 sm:px-4">
      <BillingHeader backHref="/onboarding/pricing" />

      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">
          الدفع وتفعيل الاشتراك
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          يتم تفعيل الاشتراك فورًا بعد إتمام الدفع بنجاح
        </p>
      </header>

      <div className="rounded-2xl bg-card p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">الباقة المحددة</p>
            <p className="text-lg font-bold">{labelForPlanName(selected.planName)}</p>
          </div>
        </div>

        <div className="space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">المجموع الفرعي</span>
            <span>{formatSar(priceForCycle(selected.monthlyPrice ?? 0, selected.billingCycle ?? "MONTHLY"))}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
            <span>الإجمالي</span>
            <span>{formatSar(priceForCycle(selected.monthlyPrice ?? 0, selected.billingCycle ?? "MONTHLY"))}</span>
          </div>
        </div>

        <p className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          يبدأ الاشتراك فورًا بعد الدفع. ضمان استرداد خلال 14 يومًا.
        </p>

        <Button
          type="button"
          className="mt-6 h-11 w-full"
          disabled={pending}
          onClick={async () => {
            setPending(true)
            try {
              const snap: SubscriptionResultDraft = {
                view: "success",
                planName: selected.planName,
                billingCycle: selected.billingCycle,
              }
              setLastSubscription(snap)
              setResult(snap)
              setView("success")
              setLocalOnboardingStep("attendance")
            } catch {
              toast.error("فشلت عملية الدفع")
            } finally {
              setPending(false)
            }
          }}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : "ادفع وفعّل الاشتراك"}
        </Button>
      </div>
    </div>
  )
}
