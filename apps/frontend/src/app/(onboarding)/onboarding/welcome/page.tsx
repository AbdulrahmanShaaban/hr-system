"use client"

import { useRouter } from "next/navigation"
import { Building2, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { OnboardingShell } from "@/components/onboarding/onboarding-shell"
import { setLocalOnboardingStep } from "@/lib/onboarding/draft"

export default function OnboardingWelcomePage() {
  const router = useRouter()

  return (
    <OnboardingShell step={1} percent={5}>
      <div className="flex flex-col items-center text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <Building2 className="size-8 text-primary" />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl">
          مرحبًا بك في <span className="text-primary">قوام</span>
        </h1>

        <p className="mt-3 max-w-md text-base text-muted-foreground">
          سنساعدك في إعداد مساحة العمل الخاصة بشركتك بخطوات بسيطة لنتمكن من
          تفعيل النظام بشكل كامل.
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          لن تستغرق العملية أكثر من 3 دقائق.
        </p>

        <Button
          type="button"
          onClick={() => {
            setLocalOnboardingStep("company-profile")
            router.push("/onboarding/company-profile")
          }}
          className="mt-8 h-12 w-full max-w-[420px] rounded-[6px] bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <span>ابدأ الإعداد الآن</span>
          <ArrowLeft className="ms-2 size-4" />
        </Button>
      </div>
    </OnboardingShell>
  )
}
