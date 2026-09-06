"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { BillingHeader } from "@/components/onboarding/billing-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { advanceOnboardingTo } from "@/lib/onboarding/advance"
import {
  setLocalOnboardingStep,
  setSelectedPlan,
} from "@/lib/onboarding/draft"
import {
  PLAN_UI_CONFIG,
  SALES_MAILTO,
  TRIAL_UI,
  formatEmployeeCap,
  formatSar,
  priceForCycle,
} from "@/lib/onboarding/plans-ui"
import { cn } from "@/lib/utils"

type PlanDto = {
  id: string
  name: string
  monthlyPrice: number | string
  maxEmployees: number
}

type BillingCycle = "MONTHLY" | "ANNUAL"

export default function OnboardingPricingPage() {
  const router = useRouter()
  const [cycle, setCycle] = React.useState<BillingCycle>("MONTHLY")
  const [plans, setPlans] = React.useState<PlanDto[] | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [trialPending, setTrialPending] = React.useState(false)

  React.useEffect(() => {
    setLocalOnboardingStep("pricing")
    // Demo plans
    setPlans([
      { id: "basic", name: "Basic", monthlyPrice: 99, maxEmployees: 10 },
      { id: "pro", name: "Pro", monthlyPrice: 299, maxEmployees: 50 },
      { id: "enterprise", name: "Enterprise", monthlyPrice: 899, maxEmployees: 999999 },
    ])
    setLoading(false)
  }, [])

  function selectPlan(plan: PlanDto) {
    const monthly =
      typeof plan.monthlyPrice === "string"
        ? Number(plan.monthlyPrice)
        : plan.monthlyPrice
    setSelectedPlan({
      planId: plan.id,
      billingCycle: cycle,
      planName: plan.name,
      monthlyPrice: monthly,
      maxEmployees: plan.maxEmployees,
    })
    setLocalOnboardingStep("payment")
    router.push("/onboarding/payment")
  }

  function contactSales() {
    toast.message("سيتم فتح بريد فريق المبيعات…")
    window.location.href = SALES_MAILTO
  }

  async function startFreeTrial() {
    setTrialPending(true)
    try {
      await advanceOnboardingTo("attendance")
      toast.success(`تم تفعيل التجربة المجانية (${TRIAL_UI.trialDays} يومًا)`)
      router.push("/onboarding/attendance")
    } catch {
      toast.error("تعذر تفعيل التجربة المجانية")
    } finally {
      setTrialPending(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-2 sm:px-4">
      <BillingHeader backHref="/onboarding/admin-account" />

      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          اختر الباقة المناسبة لشركتك
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          ابدأ بإدارة مواردك البشرية بكفاءة — يمكنك الترقية أو التغيير في أي وقت
        </p>

        <div className="mt-6 inline-flex items-center gap-1 rounded-full border border-border bg-background p-1">
          <button
            type="button"
            onClick={() => setCycle("MONTHLY")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              cycle === "MONTHLY"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            شهريًا
          </button>
          <button
            type="button"
            onClick={() => setCycle("ANNUAL")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              cycle === "ANNUAL"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            سنويًا
            <Badge
              variant="secondary"
              className={cn(
                "h-5 border-0 bg-amber-100 text-[10px] text-amber-800",
                cycle === "ANNUAL" && "bg-white/20 text-white",
              )}
            >
              وفّر شهرين
            </Badge>
          </button>
        </div>
      </div>

      {loading || !plans ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[420px] w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:items-center">
          {/* Free trial */}
          <article className="relative flex flex-col rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6">
            <Badge className="absolute -top-2.5 start-4 bg-emerald-600 px-3">
              بدون بطاقة
            </Badge>
            <h2 className="text-lg font-bold">{TRIAL_UI.label}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {TRIAL_UI.description}
            </p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-primary">مجانًا</span>
              <span className="text-xs text-muted-foreground">
                / {TRIAL_UI.trialDays} يومًا
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              حتى {TRIAL_UI.maxEmployees} موظف
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-5 h-10 w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              disabled={trialPending}
              onClick={() => void startFreeTrial()}
            >
              {trialPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                TRIAL_UI.ctaLabel
              )}
            </Button>
            <ul className="mt-6 flex flex-1 flex-col gap-2.5">
              {TRIAL_UI.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-sm text-foreground/90"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </article>

          {plans.map((plan, idx) => {
            const ui = PLAN_UI_CONFIG[idx] ?? PLAN_UI_CONFIG[0]!
            const monthly =
              typeof plan.monthlyPrice === "string"
                ? Number(plan.monthlyPrice)
                : Number(plan.monthlyPrice)
            const displayPrice = priceForCycle(monthly, cycle)
            const highlighted = !!ui.highlighted

            return (
              <article
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-card p-6",
                  highlighted
                    ? "z-10 border-primary shadow-[0_12px_40px_rgb(31,145,32,0.18)] xl:scale-105 xl:py-8"
                    : "border-border",
                )}
              >
                {highlighted && (
                  <Badge className="absolute -top-2.5 start-1/2 -translate-x-1/2 bg-primary px-3">
                    الأكثر شيوعًا
                  </Badge>
                )}

                <h2 className="text-lg font-bold">{ui.label}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {ui.description}
                </p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">
                    {formatSar(displayPrice).replace(" ر.س", "")}
                  </span>
                  <span className="text-sm text-muted-foreground">ر.س</span>
                  <span className="text-xs text-muted-foreground">
                    / {cycle === "ANNUAL" ? "سنة" : "شهر"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatEmployeeCap(plan.maxEmployees)}
                </p>

                <Button
                  type="button"
                  variant={ui.cta === "sales" ? "outline" : "default"}
                  className="mt-5 h-10 w-full"
                  onClick={() =>
                    ui.cta === "sales" ? contactSales() : selectPlan(plan)
                  }
                >
                  {ui.ctaLabel}
                </Button>

                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  {ui.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-foreground/90"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
