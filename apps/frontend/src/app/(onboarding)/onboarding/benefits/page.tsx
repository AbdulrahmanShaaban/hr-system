"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { OnboardingShell } from "@/components/onboarding/onboarding-shell"
import { OnboardingFooter } from "@/components/onboarding/onboarding-footer"
import {
  getOnboardingDraft,
  patchOnboardingDraft,
} from "@/lib/onboarding/draft"
import { advanceOnboardingTo } from "@/lib/onboarding/advance"
import { cn } from "@/lib/utils"

const INSURANCE_TIERS = ["C", "B", "A", "VIP"]

const schema = z
  .object({
    tier: z.string(),
    gosiEnabled: z.boolean(),
    housingAllowance: z.boolean(),
    transportAllowance: z.boolean(),
    annualTickets: z.boolean(),
    directDeposit: z.boolean(),
    housingAmount: z.union([z.number(), z.string()]).optional(),
    housingIsPercentage: z.boolean(),
    transportAmount: z.union([z.number(), z.string()]).optional(),
    annualTicketsAmount: z.union([z.number(), z.string()]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.housingAllowance) {
      const n = Number(data.housingAmount)
      if (!Number.isFinite(n) || n <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "أدخل قيمة بدل السكن",
          path: ["housingAmount"],
        })
      }
    }
    if (data.transportAllowance) {
      const n = Number(data.transportAmount)
      if (!Number.isFinite(n) || n <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "أدخل قيمة بدل المواصلات",
          path: ["transportAmount"],
        })
      }
    }
    if (data.annualTickets) {
      const n = Number(data.annualTicketsAmount)
      if (!Number.isFinite(n) || n <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "أدخل قيمة التذاكر السنوية",
          path: ["annualTicketsAmount"],
        })
      }
    }
  })

type FormValues = z.infer<typeof schema>

export default function OnboardingBenefitsPage() {
  const router = useRouter()
  const draft = getOnboardingDraft().benefits
  const [pending, setPending] = React.useState(false)
  const [selectedTier, setSelectedTier] = React.useState(draft?.tier ?? "B")

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tier: draft?.tier ?? "B",
      gosiEnabled: draft?.gosiEnabled ?? true,
      housingAllowance: draft?.benefits?.housingAllowance ?? false,
      transportAllowance: draft?.benefits?.transportAllowance ?? true,
      annualTickets: draft?.benefits?.annualTickets ?? true,
      directDeposit: draft?.benefits?.directDeposit ?? true,
      housingAmount: Number(draft?.housingAmount ?? 25),
      housingIsPercentage: draft?.housingIsPercentage ?? true,
      transportAmount: Number(draft?.transportAmount ?? 500),
      annualTicketsAmount: Number(draft?.annualTicketsAmount ?? 3600),
    },
    mode: "onChange",
  })

  const values = form.watch()

  async function saveAndNext(data: FormValues) {
    setPending(true)
    try {
      patchOnboardingDraft({
        benefits: {
          provider: "",
          tier: data.tier,
          gosiEnabled: data.gosiEnabled,
          benefits: {
            housingAllowance: data.housingAllowance,
            transportAllowance: data.transportAllowance,
            annualTickets: data.annualTickets,
            directDeposit: data.directDeposit,
          },
          housingAmount: String(data.housingAmount ?? ""),
          housingIsPercentage: data.housingIsPercentage,
          transportAmount: String(data.transportAmount ?? ""),
          annualTicketsAmount: String(data.annualTicketsAmount ?? ""),
        },
      })
      await advanceOnboardingTo("employees")
      router.push("/onboarding/employees")
    } catch {
      toast.error("تعذر حفظ المزايا")
    } finally {
      setPending(false)
    }
  }

  return (
    <OnboardingShell step={8}>
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          إعداد المزايا والتأمينات
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          حدد خطط التأمين الطبي والمزايا الإضافية لموظفيك.
        </p>
      </header>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(saveAndNext)}
          className="flex flex-col gap-6"
          noValidate
        >
          <div className="space-y-4">
            <p className="text-sm font-bold text-foreground">التأمين الطبي</p>

            <div className="space-y-2.5">
              <FormLabel>فئة التأمين</FormLabel>
              <div className="flex gap-2">
                {INSURANCE_TIERS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setSelectedTier(t)
                      form.setValue("tier", t, { shouldValidate: true })
                    }}
                    className={cn(
                      "h-12 flex-1 rounded-[6px] border px-3 text-sm font-medium transition-colors",
                      selectedTier === t
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-muted",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-[6px] border border-border p-4">
            <div>
              <p className="font-medium text-foreground">التأمينات الاجتماعية</p>
              <p className="mt-1 text-sm text-muted-foreground">
                التسجيل التلقائي في نظام التأمينات الاجتماعية (GOSI)
              </p>
            </div>
            <Switch
              checked={values.gosiEnabled}
              onCheckedChange={(v) =>
                form.setValue("gosiEnabled", v, { shouldValidate: true })
              }
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-foreground">مزايا إضافية</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <BenefitToggle
                checked={values.annualTickets}
                onToggle={() =>
                  form.setValue("annualTickets", !values.annualTickets, {
                    shouldValidate: true,
                  })
                }
                title="تذاكر سنوية"
                description="قيمة سنوية — تُحتسب شهرياً في كشف الراتب"
              >
                {values.annualTickets && (
                  <FormField
                    control={form.control}
                    name="annualTicketsAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>القيمة السنوية (ريال)</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </BenefitToggle>

              <BenefitToggle
                checked={values.transportAllowance}
                onToggle={() =>
                  form.setValue(
                    "transportAllowance",
                    !values.transportAllowance,
                    { shouldValidate: true },
                  )
                }
                title="بدل مواصلات"
                description="قيمة ثابتة شهرياً تُضاف لكل موظف تلقائياً"
              >
                {values.transportAllowance && (
                  <FormField
                    control={form.control}
                    name="transportAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المبلغ الشهري (ريال)</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </BenefitToggle>

              <BenefitToggle
                checked={values.housingAllowance}
                onToggle={() =>
                  form.setValue("housingAllowance", !values.housingAllowance, {
                    shouldValidate: true,
                  })
                }
                title="بدل سكن"
                description="نسبة من الراتب الأساسي أو مبلغ ثابت"
              >
                {values.housingAllowance && (
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="housingAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {values.housingIsPercentage
                              ? "النسبة من الراتب (%)"
                              : "المبلغ الشهري (ريال)"}
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Checkbox
                        checked={values.housingIsPercentage}
                        onCheckedChange={(c) =>
                          form.setValue("housingIsPercentage", c === true, {
                            shouldValidate: true,
                          })
                        }
                      />
                      احتساب كنسبة مئوية من الراتب الأساسي
                    </label>
                  </div>
                )}
              </BenefitToggle>

              <BenefitToggle
                checked={values.directDeposit}
                onToggle={() =>
                  form.setValue("directDeposit", !values.directDeposit, {
                    shouldValidate: true,
                  })
                }
                title="تفعيل التحويل البنكي المباشر"
                description="تفعيل دفع الرواتب مباشرة من خلال النظام"
              />
            </div>
          </div>

          <OnboardingFooter
            onBack={() => router.push("/onboarding/payroll")}
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

function BenefitToggle({
  checked,
  onToggle,
  title,
  description,
  children,
}: {
  checked: boolean
  onToggle: () => void
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-[6px] border p-4 transition-colors",
        checked ? "border-primary bg-primary/5" : "border-border bg-background",
      )}
    >
      <label className="flex cursor-pointer items-start gap-2.5">
        <Checkbox
          checked={checked}
          onCheckedChange={onToggle}
          className="mt-0.5"
        />
        <span>
          <span className="block text-sm font-medium text-foreground">
            {title}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {description}
          </span>
        </span>
      </label>
      {children}
    </div>
  )
}
