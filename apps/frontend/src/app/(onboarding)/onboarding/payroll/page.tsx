"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { OnboardingShell } from "@/components/onboarding/onboarding-shell"
import { OnboardingFooter } from "@/components/onboarding/onboarding-footer"
import {
  cycleToApi,
  getOnboardingDraft,
  patchOnboardingDraft,
} from "@/lib/onboarding/draft"
import { advanceOnboardingTo } from "@/lib/onboarding/advance"
import { cn } from "@/lib/utils"

const CURRENCIES = [{ label: "ريال سعودي - SAR", value: "SAR" }]

const CYCLES = [
  { label: "شهري", value: "monthly" },
  { label: "اسبوعين", value: "biweekly" },
  { label: "اسبوعي", value: "weekly" },
]

const schema = z.object({
  currency: z.string().min(1, "العملة مطلوبة"),
  cycle: z.string().min(1, "دورة الرواتب مطلوبة"),
  payoutDay: z
    .union([z.number(), z.string()])
    .transform((v) => (v === "" ? NaN : Number(v)))
    .refine((n) => Number.isInteger(n) && n >= 1 && n <= 31, {
      message: "يوم الصرف يجب أن يكون بين 1 و 31",
    }),
  directDeposit: z.boolean(),
})

type FormInput = z.input<typeof schema>
type FormValues = z.output<typeof schema>

export default function OnboardingPayrollPage() {
  const router = useRouter()
  const draft = getOnboardingDraft().payroll
  const [pending, setPending] = React.useState(false)
  const [selectedCycle, setSelectedCycle] = React.useState(
    draft?.cycle ?? "monthly",
  )

  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: draft?.currency ?? "SAR",
      cycle: draft?.cycle ?? "monthly",
      payoutDay: Number(draft?.payoutDay ?? 27),
      directDeposit: draft?.directDeposit ?? true,
    },
    mode: "onChange",
  })

  const directDeposit = form.watch("directDeposit") as boolean

  async function saveAndNext(values: FormValues) {
    setPending(true)
    try {
      patchOnboardingDraft({
        payroll: {
          currency: values.currency,
          cycle: values.cycle,
          payoutDay: String(values.payoutDay),
          directDeposit: values.directDeposit,
        },
      })
      await advanceOnboardingTo("benefits")
      router.push("/onboarding/benefits")
    } catch {
      toast.error("تعذر حفظ إعدادات الرواتب")
    } finally {
      setPending(false)
    }
  }

  return (
    <OnboardingShell step={7}>
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">إعدادات الرواتب</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          قم بتحديد العملة، دورة الرواتب، وتاريخ الصرف الأساسي لمنشأتك.
        </p>
      </header>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(saveAndNext)}
          className="flex flex-col gap-6"
          noValidate
        >
          <div className="space-y-2.5">
            <FormLabel>العملة</FormLabel>
            <select
              className="flex h-12 w-full rounded-[6px] border border-input bg-background px-4 py-2 text-start text-sm"
              {...form.register("currency")}
            >
              {CURRENCIES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2.5">
            <FormLabel>دورة الرواتب</FormLabel>
            <div className="flex gap-2">
              {CYCLES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSelectedCycle(opt.value)
                    form.setValue("cycle", opt.value, { shouldValidate: true })
                  }}
                  className={cn(
                    "h-10 flex-1 rounded-[6px] border px-3 text-sm font-medium transition-colors",
                    selectedCycle === opt.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-xs space-y-2.5">
            <FormField
              control={form.control}
              name="payoutDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>يوم صرف الرواتب</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={31} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-sm text-muted-foreground">
              سيتم احتساب المصروفات نهاية آخر يوم قبل هذا التاريخ بـ 3 أيام عمل.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-[6px] border border-border p-4">
            <div>
              <p className="font-medium text-foreground">
                تفعيل التحويل البنكي المباشر
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                تمكين دفع الرواتب مباشرة من خلال النظام عبر الربط المصرفي.
              </p>
            </div>
            <Switch
              checked={directDeposit}
              onCheckedChange={(v) =>
                form.setValue("directDeposit", v, { shouldValidate: true })
              }
            />
          </div>

          <OnboardingFooter
            onBack={() => router.push("/onboarding/attendance")}
            nextType="submit"
            onSkip={() => form.handleSubmit(saveAndNext)()}
            nextPending={pending}
            nextDisabled={!form.formState.isValid}
          />
        </form>
      </Form>
    </OnboardingShell>
  )
}
