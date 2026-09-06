"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Check,
  Building2,
  UserCog,
  Clock,
  Wallet,
  HeartHandshake,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { clearOnboardingDraft, setLocalOnboardingStep } from "@/lib/onboarding/draft"

const SUMMARY_ITEMS = [
  { label: "ملف الشركة", Icon: Building2 },
  { label: "الموظفين", Icon: Users },
  { label: "مسؤول النظام", Icon: UserCog },
  { label: "نظام الرواتب", Icon: Wallet },
  { label: "المزايا والتأمينات", Icon: HeartHandshake },
  { label: "سياسة الحضور", Icon: Clock },
] as const

export default function OnboardingCompletePage() {
  const router = useRouter()
  const [finishing, setFinishing] = React.useState(false)

  React.useEffect(() => {
    setLocalOnboardingStep("complete")
  }, [])

  function goToDashboard() {
    setFinishing(true)
    try {
      clearOnboardingDraft()
      router.replace("/")
    } catch {
      setFinishing(false)
      toast.error("تعذر إكمال الإعداد")
    }
  }

  return (
    <div className="mx-auto w-full max-w-[560px] rounded-2xl bg-card p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-10">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="size-7" strokeWidth={2.75} />
      </div>

      <h1 className="mt-5 text-2xl font-bold text-foreground">
        تهانينا! أنت جاهز لتبدأ
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        لقد أكملت جميع خطوات إعداد شركتك، وأصبحت مساحة العمل جاهزة لتفعيل
        النظام بشكل كامل.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SUMMARY_ITEMS.map(({ label, Icon }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 rounded-[6px] border border-border p-4"
          >
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-4" />
            </div>
            <p className="text-sm font-medium text-foreground">{label}</p>
          </div>
        ))}
      </div>

      <Button
        type="button"
        disabled={finishing}
        onClick={() => goToDashboard()}
        className="mt-8 h-12 w-full rounded-[6px] bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
      >
        {finishing ? "جارٍ التحويل…" : "تهيئة لوحة التحكم"}
      </Button>
    </div>
  )
}
