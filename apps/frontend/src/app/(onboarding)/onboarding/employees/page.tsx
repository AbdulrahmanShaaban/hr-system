"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { UserPlus, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { OnboardingShell } from "@/components/onboarding/onboarding-shell"
import { OnboardingFooter } from "@/components/onboarding/onboarding-footer"
import {
  getOnboardingEmployeesCsv,
  setOnboardingEmployeesCsv,
  clearOnboardingDraft,
} from "@/lib/onboarding/draft"
import { advanceOnboardingTo } from "@/lib/onboarding/advance"

const CSV_TEMPLATE = `name,email,basicSalary,employmentType
Ahmed Ali,ahmed@example.com,5000,PERMANENT
Sara Omar,sara@example.com,4500,PERMANENT
`

const MAX_CSV_BYTES = 5 * 1024 * 1024

function isCsvFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return (
    name.endsWith(".csv") ||
    file.type === "text/csv" ||
    file.type === "application/vnd.ms-excel"
  )
}

export default function OnboardingEmployeesPage() {
  const router = useRouter()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [csvName, setCsvName] = React.useState<string | null>(
    getOnboardingEmployeesCsv()?.name ?? null,
  )
  const [pending, setPending] = React.useState(false)
  const [importSummary, setImportSummary] = React.useState<string | null>(null)
  const [csvError, setCsvError] = React.useState<string | null>(null)

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "employees-template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  function onCsvSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!isCsvFile(file)) {
      setCsvError("يرجى اختيار ملف CSV صالح")
      setOnboardingEmployeesCsv(null)
      setCsvName(null)
      return
    }
    if (file.size > MAX_CSV_BYTES) {
      setCsvError("حجم الملف يجب ألا يتجاوز 5 ميجابايت")
      setOnboardingEmployeesCsv(null)
      setCsvName(null)
      return
    }
    setCsvError(null)
    setOnboardingEmployeesCsv(file)
    setCsvName(file.name)
    setImportSummary(null)
  }

  async function goComplete() {
    await advanceOnboardingTo("complete")
    router.push("/onboarding/complete")
  }

  return (
    <OnboardingShell step={9}>
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          إضافة بيانات الموظفين
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ضف موظفيك الآن أو أضفهم لاحقاً، حسب رغبتك
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col items-center gap-3 rounded-[6px] border border-border p-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserPlus className="size-6" />
          </div>
          <p className="font-bold text-foreground">إضافة موظفين يدويًا</p>
          <p className="text-sm text-muted-foreground">
            أضف الموظفين واحدًا تلو الآخر مع إدخال جميع بياناتهم يدويًا
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void goComplete()}
            className="mt-2 h-10 w-full rounded-[6px]"
          >
            ابدأ الإضافة يدويًا
          </Button>
        </div>

        <div className="flex flex-col items-center gap-3 rounded-[6px] border border-border p-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileSpreadsheet className="size-6" />
          </div>
          <p className="font-bold text-foreground">استيراد ملف CSV</p>
          <p className="text-sm text-muted-foreground">
            قم برفع ملف بيانات الموظفين الحالي بصيغة CSV
          </p>
          <div className="mt-2 flex w-full flex-col gap-2">
            <Button
              type="button"
              onClick={downloadTemplate}
              className="h-10 w-full rounded-[6px] bg-primary text-primary-foreground hover:bg-primary/90"
            >
              تحميل النموذج
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="h-10 w-full rounded-[6px]"
            >
              {csvName ? "تغيير الملف" : "رفع ملف CSV"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={onCsvSelected}
            />
            {csvName && (
              <p className="truncate text-xs text-muted-foreground" dir="ltr">
                {csvName}
              </p>
            )}
            {csvError && (
              <p className="text-xs text-destructive">{csvError}</p>
            )}
          </div>
        </div>
      </div>

      {importSummary && (
        <p className="mt-4 text-center text-sm font-medium text-primary">
          {importSummary}
        </p>
      )}

      <p className="mt-4 text-center text-sm text-muted-foreground">
        لا تقلق، يمكنك دائماً إضافة المزيد من بيانات الموظفين من لوحة التحكم لاحقاً
      </p>

      <OnboardingFooter
        onBack={() => router.push("/onboarding/benefits")}
        onNext={() => void goComplete()}
        onSkip={() => void goComplete()}
        nextPending={pending}
        nextLabel={csvName ? "استيراد ومتابعة" : "متابعة"}
      />
    </OnboardingShell>
  )
}
