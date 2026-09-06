"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { UploadCloud, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { OnboardingShell } from "@/components/onboarding/onboarding-shell"
import { OnboardingFooter } from "@/components/onboarding/onboarding-footer"
import {
  getOnboardingDraft,
  patchOnboardingDraft,
  setLocalOnboardingStep,
} from "@/lib/onboarding/draft"

const INDUSTRY_OPTIONS = [
  { label: "تجارة وتجزئة", value: "retail" },
  { label: "تقنية المعلومات", value: "it" },
  { label: "الصناعة والتصنيع", value: "manufacturing" },
  { label: "الخدمات المهنية", value: "professional-services" },
  { label: "الرعاية الصحية", value: "healthcare" },
  { label: "التعليم", value: "education" },
  { label: "الخدمات اللوجستية", value: "logistics" },
  { label: "أخرى", value: "other" },
]

const schema = z.object({
  companyName: z.string().min(1, "اسم الشركة مطلوب"),
  website: z
    .string()
    .min(1, "الموقع الالكتروني مطلوب")
    .regex(/^(https?:\/\/)?[\w-]+(\.[\w-]+)+.*$/, "أدخل رابطًا صحيحًا"),
  industry: z.string().min(1, "قطاع العمل مطلوب"),
})

type FormValues = z.infer<typeof schema>

export default function OnboardingCompanyProfilePage() {
  const router = useRouter()
  const draft = getOnboardingDraft().company
  const [logoUrl, setLogoUrl] = React.useState<string | null>(
    draft?.logoUrl ?? null,
  )
  const [logoUploading, setLogoUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: draft?.companyName ?? "",
      website: draft?.website ?? "",
      industry: draft?.industry ?? "",
    },
    mode: "onChange",
  })

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار صورة للشعار")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم الشعار يجب ألا يتجاوز 2 ميجابايت")
      return
    }

    const reader = new FileReader()
    reader.onload = () => setLogoUrl(reader.result as string)
    reader.readAsDataURL(file)

    setLogoUploading(true)
    try {
      // Simulate upload delay for demo
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const uploadedUrl = reader.result as string
      setLogoUrl(uploadedUrl)
      const current = getOnboardingDraft().company
      patchOnboardingDraft({
        company: {
          companyName: current?.companyName ?? form.getValues("companyName"),
          website: current?.website ?? form.getValues("website"),
          industry: current?.industry ?? form.getValues("industry"),
          logoUrl: uploadedUrl,
        },
      })
      toast.success("تم رفع الشعار")
    } catch {
      toast.error("تعذر رفع الشعار")
      setLogoUrl(draft?.logoUrl ?? null)
    } finally {
      setLogoUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <OnboardingShell step={2}>
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">إعداد ملف الشركة</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          أخبرنا المزيد عن شركتك لنتمكن من تخصيص تجربتك.
        </p>
      </header>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => {
            const effectiveLogo =
              logoUrl && !logoUrl.startsWith("data:")
                ? logoUrl
                : getOnboardingDraft().company?.logoUrl
            if (!effectiveLogo || effectiveLogo.startsWith("data:")) {
              toast.error("يرجى رفع شعار الشركة")
              return
            }
            patchOnboardingDraft({
              company: {
                companyName: values.companyName,
                website: values.website,
                industry: values.industry,
                logoUrl: effectiveLogo,
              },
            })
            setLocalOnboardingStep("admin-account")
            router.push("/onboarding/admin-account")
          })}
          className="flex flex-col gap-6"
          noValidate
        >
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={logoUploading}
              className="flex size-20 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary disabled:opacity-60"
            >
              {logoUploading ? (
                <Loader2 className="size-6 animate-spin text-primary" />
              ) : logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt="شعار الشركة"
                  className="size-full object-cover"
                />
              ) : (
                <UploadCloud className="size-6 text-muted-foreground" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={logoUploading}
              className="text-sm font-medium text-primary hover:underline disabled:opacity-60"
            >
              {logoUploading ? "جارٍ رفع الشعار…" : "رفع شعار الشركة"}
            </button>
          </div>

          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم الشركة *</FormLabel>
                <FormControl>
                  <Input placeholder="ادخل اسم شركتك" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الموقع الالكتروني *</FormLabel>
                  <FormControl>
                    <Input placeholder="www.example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>قطاع العمل *</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-[6px] border border-input bg-background px-3 py-2 text-sm"
                      {...field}
                    >
                      <option value="">اختر القطاع</option>
                      {INDUSTRY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <OnboardingFooter
            onBack={() => {
              setLocalOnboardingStep("welcome")
              router.push("/onboarding/welcome")
            }}
            nextType="submit"
            nextDisabled={!form.formState.isValid || logoUploading}
          />
        </form>
      </Form>
    </OnboardingShell>
  )
}
