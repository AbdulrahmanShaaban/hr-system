"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Info } from "lucide-react"
import { toast } from "sonner"

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { OnboardingShell } from "@/components/onboarding/onboarding-shell"
import { OnboardingFooter } from "@/components/onboarding/onboarding-footer"
import {
  getOnboardingDraft,
  patchOnboardingDraft,
  workDaysToWeekendDays,
} from "@/lib/onboarding/draft"
import { advanceOnboardingTo } from "@/lib/onboarding/advance"
import { cn } from "@/lib/utils"

const DAYS = [
  { label: "الأحد", value: "sun" },
  { label: "الاثنين", value: "mon" },
  { label: "الثلاثاء", value: "tue" },
  { label: "الأربعاء", value: "wed" },
  { label: "الخميس", value: "thu" },
  { label: "الجمعة", value: "fri" },
  { label: "السبت", value: "sat" },
]

const DEFAULT_WORK_DAYS = ["sun", "mon", "tue", "wed", "thu"]

const schema = z
  .object({
    workDays: z.array(z.string()).min(1, "اختر يوم عمل واحد على الأقل"),
    startTime: z.string().min(1, "وقت البداية مطلوب"),
    endTime: z.string().min(1, "وقت النهاية مطلوب"),
    graceMinutes: z
      .union([z.number(), z.string()])
      .transform((v) => (v === "" ? NaN : Number(v)))
      .refine((n) => Number.isInteger(n) && n >= 0 && n <= 120, {
        message: "فترة السماح يجب أن تكون بين 0 و 120 دقيقة",
      }),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "وقت النهاية يجب أن يكون بعد وقت البداية",
    path: ["endTime"],
  })

type FormInput = z.input<typeof schema>
type FormValues = z.output<typeof schema>

export default function OnboardingAttendancePage() {
  const router = useRouter()
  const draft = getOnboardingDraft().attendance
  const [pending, setPending] = React.useState(false)
  const [selectedDays, setSelectedDays] = React.useState<string[]>(
    draft?.workDays ?? DEFAULT_WORK_DAYS,
  )

  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      workDays: draft?.workDays ?? DEFAULT_WORK_DAYS,
      startTime: draft?.startTime ?? "08:00",
      endTime: draft?.endTime ?? "17:00",
      graceMinutes: Number(draft?.graceMinutes ?? 15),
    },
    mode: "onChange",
  })

  function toggleDay(day: string) {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day]
    if (next.length > 0) {
      setSelectedDays(next)
      form.setValue("workDays", next, { shouldValidate: true })
    }
  }

  async function saveAndNext(values: FormValues) {
    setPending(true)
    try {
      const weekendDays = workDaysToWeekendDays(values.workDays)
      patchOnboardingDraft({
        attendance: {
          workDays: values.workDays,
          startTime: values.startTime,
          endTime: values.endTime,
          graceMinutes: String(values.graceMinutes),
        },
      })
      await advanceOnboardingTo("payroll")
      router.push("/onboarding/payroll")
    } catch {
      toast.error("تعذر حفظ الإعدادات")
    } finally {
      setPending(false)
    }
  }

  return (
    <OnboardingShell step={6}>
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          إعدادات الحضور والانصراف
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          حدد ساعات العمل الافتراضية وسياسات الحضور لمؤسستك.
        </p>
      </header>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(saveAndNext)}
          className="flex flex-col gap-6"
          noValidate
        >
          <div className="space-y-2.5">
            <FormLabel>أيام العمل</FormLabel>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={cn(
                    "h-10 min-w-[4.5rem] flex-1 rounded-[6px] border px-3 text-sm font-medium transition-colors",
                    selectedDays.includes(day.value)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted",
                  )}
                >
                  {day.label}
                </button>
              ))}
            </div>
            {form.formState.errors.workDays && (
              <p className="text-sm text-destructive">
                {form.formState.errors.workDays.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ساعات العمل : من</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ساعات العمل : الى</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="max-w-xs">
            <FormField
              control={form.control}
              name="graceMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>فترة السماح (بالدقائق)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} max={120} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-start gap-2 rounded-[6px] bg-primary/10 px-4 py-3 text-start text-sm text-primary">
            <Info className="mt-0.5 size-4 shrink-0" />
            <p>
              سيتم تطبيق هذه الإعدادات كقيم افتراضية لجميع الموظفين الجدد
              ويمكن تخصيصها لكل موظف على حدة.
            </p>
          </div>

          <OnboardingFooter
            onBack={() => router.push("/onboarding/admin-account")}
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
