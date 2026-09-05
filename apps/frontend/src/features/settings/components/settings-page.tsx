"use client";

import React, { useState } from "react";
import { Loader2, Plus, Building2, Calendar, Banknote, Clock, Shield, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toaster";

interface SettingsSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const sections: SettingsSection[] = [
  { id: "company", label: "الملف الشخصي للشركة", icon: <Building2 className="h-4 w-4" /> },
  { id: "attendance", label: "إعدادات الحضور", icon: <Clock className="h-4 w-4" /> },
  { id: "payroll", label: "إعدادات الرواتب", icon: <Banknote className="h-4 w-4" /> },
  { id: "benefits", label: "المزايا والبدلات", icon: <Shield className="h-4 w-4" /> },
  { id: "leave-types", label: "أنواع الإجازات", icon: <Calendar className="h-4 w-4" /> },
  { id: "loan-types", label: "أنواع السلف", icon: <Banknote className="h-4 w-4" /> },
  { id: "shifts", label: "الورديات", icon: <Clock className="h-4 w-4" /> },
];

const placeholderLeaveTypes = [
  { id: "1", name: "إجازة سنوية", defaultDays: 21, isPaid: true },
  { id: "2", name: "إجازة مرضية", defaultDays: 14, isPaid: true },
  { id: "3", name: "إجازة شخصية", defaultDays: 5, isPaid: false },
  { id: "4", name: "إجازة أمومة", defaultDays: 90, isPaid: true },
];

const placeholderLoanTypes = [
  { id: "1", name: "سلفة شخصية", maxAmount: 100000, interestRate: 5 },
  { id: "2", name: "سلفة راتب", maxAmount: 24000, interestRate: 0 },
  { id: "3", name: "سلفة طارئة", maxAmount: 50000, interestRate: 3 },
];

const placeholderShifts = [
  { id: "1", name: "وردية صباحية", startTime: "08:00", endTime: "16:00", graceMinutes: 15 },
  { id: "2", name: "وردية مسائية", startTime: "16:00", endTime: "00:00", graceMinutes: 15 },
  { id: "3", name: "وردية ليلية", startTime: "00:00", endTime: "08:00", graceMinutes: 30 },
];

const WORK_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export function SettingsPage() {
  const { addToast } = useToast();
  const [activeSection, setActiveSection] = useState("company");

  // Company Profile
  const [companyName, setCompanyName] = useState("شركة قَوام للتكنولوجيا");
  const [companyEmail, setCompanyEmail] = useState("hr@qawam.com");
  const [companyPhone, setCompanyPhone] = useState("+20 123 456 7890");
  const [companyAddress, setCompanyAddress] = useState("القاهرة، مصر");
  const [companyTimezone, setCompanyTimezone] = useState("Africa/Cairo");
  const [companyCurrency, setCompanyCurrency] = useState("EGP");
  const [companyWebsite, setCompanyWebsite] = useState("https://qawam.com");
  const [companyIndustry, setCompanyIndustry] = useState("تقنية المعلومات");

  // Attendance Settings
  const [defaultGraceMinutes, setDefaultGraceMinutes] = useState("15");
  const [autoClockOut, setAutoClockOut] = useState("17:00");
  const [overtimeEnabled, setOvertimeEnabled] = useState(true);
  const [overtimeRate, setOvertimeRate] = useState("1.5");
  const [maxLateMinutes, setMaxLateMinutes] = useState("30");
  const [workDays, setWorkDays] = useState<string[]>(["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"]);

  // Payroll Settings
  const [payrollCycle, setPayrollCycle] = useState("monthly");
  const [payoutDay, setPayoutDay] = useState("28");
  const [directDeposit, setDirectDeposit] = useState(true);
  const [currency, setCurrency] = useState("EGP");
  const [gosiEnabled, setGosiEnabled] = useState(true);
  const [gosiEmployeeRate, setGosiEmployeeRate] = useState("11");
  const [gosiEmployerRate, setGosiEmployerRate] = useState("12");

  // Benefits Settings
  const [housingAllowance, setHousingAllowance] = useState(false);
  const [housingAmount, setHousingAmount] = useState("");
  const [transportAllowance, setTransportAllowance] = useState(false);
  const [transportAmount, setTransportAmount] = useState("");
  const [annualTickets, setAnnualTickets] = useState(false);
  const [ticketsAmount, setTicketsAmount] = useState("");
  const [medicalInsurance, setMedicalInsurance] = useState(false);

  // Leave Types
  const [leaveTypes, setLeaveTypes] = useState(placeholderLeaveTypes);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [newLeaveName, setNewLeaveName] = useState("");
  const [newLeaveDays, setNewLeaveDays] = useState("");
  const [newLeavePaid, setNewLeavePaid] = useState(true);

  // Loan Types
  const [loanTypes, setLoanTypes] = useState(placeholderLoanTypes);
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [newLoanName, setNewLoanName] = useState("");
  const [newLoanMax, setNewLoanMax] = useState("");
  const [newLoanRate, setNewLoanRate] = useState("");

  // Shifts
  const [shifts, setShifts] = useState(placeholderShifts);
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [newShiftName, setNewShiftName] = useState("");
  const [newShiftStart, setNewShiftStart] = useState("");
  const [newShiftEnd, setNewShiftEnd] = useState("");
  const [newShiftGrace, setNewShiftGrace] = useState("");

  const toggleWorkDay = (day: string) => {
    setWorkDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAddLeaveType = () => {
    setLeaveTypes([
      ...leaveTypes,
      { id: String(Date.now()), name: newLeaveName, defaultDays: parseInt(newLeaveDays) || 0, isPaid: newLeavePaid },
    ]);
    setLeaveDialogOpen(false);
    setNewLeaveName("");
    setNewLeaveDays("");
    setNewLeavePaid(true);
  };

  const handleAddLoanType = () => {
    setLoanTypes([
      ...loanTypes,
      { id: String(Date.now()), name: newLoanName, maxAmount: parseFloat(newLoanMax) || 0, interestRate: parseFloat(newLoanRate) || 0 },
    ]);
    setLoanDialogOpen(false);
    setNewLoanName("");
    setNewLoanMax("");
    setNewLoanRate("");
  };

  const handleAddShift = () => {
    setShifts([
      ...shifts,
      { id: String(Date.now()), name: newShiftName, startTime: newShiftStart, endTime: newShiftEnd, graceMinutes: parseInt(newShiftGrace) || 0 },
    ]);
    setShiftDialogOpen(false);
    setNewShiftName("");
    setNewShiftStart("");
    setNewShiftEnd("");
    setNewShiftGrace("");
  };

  const handleSave = () => {
    addToast({ title: "تم بنجاح", description: "تم حفظ الإعدادات بنجاح", variant: "success" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">الإعدادات</h1>
        <p className="mt-1 text-muted-foreground">
          تكوين إعدادات مؤسستك وتفضيلاتها.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex lg:w-56 flex-row lg:flex-col gap-1 overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeSection === section.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0">
          {/* Company Profile */}
          {activeSection === "company" && (
            <Card>
              <CardHeader>
                <CardTitle>الملف الشخصي للشركة</CardTitle>
                <CardDescription>إدارة معلومات شركتك.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="اسم الشركة" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                  <Input label="الموقع الإلكتروني" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} />
                  <Input label="البريد الإلكتروني" type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
                  <Input label="الهاتف" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
                  <Input label="العنوان" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
                  <Input label="المجال" value={companyIndustry} onChange={(e) => setCompanyIndustry(e.target.value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">المنطقة الزمنية</label>
                    <Select value={companyTimezone} onValueChange={setCompanyTimezone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Cairo">القاهرة (UTC+2)</SelectItem>
                        <SelectItem value="Asia/Dubai">دبي (UTC+4)</SelectItem>
                        <SelectItem value="Europe/London">لندن (UTC+0)</SelectItem>
                        <SelectItem value="America/New_York">نيويورك (UTC-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">العملة</label>
                    <Select value={companyCurrency} onValueChange={setCompanyCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EGP">جنيه مصري</SelectItem>
                        <SelectItem value="USD">دولار أمريكي</SelectItem>
                        <SelectItem value="AED">درهم إماراتي</SelectItem>
                        <SelectItem value="SAR">ريال سعودي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4" />
                    حفظ التغييرات
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attendance Settings */}
          {activeSection === "attendance" && (
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الحضور والانصراف</CardTitle>
                <CardDescription>تكوين سياسات الحضور والانصراف.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input type="number" label="فترة السماح (دقائق)" value={defaultGraceMinutes} onChange={(e) => setDefaultGraceMinutes(e.target.value)} />
                  <Input type="time" label="وقت الانصراف التلقائي" value={autoClockOut} onChange={(e) => setAutoClockOut(e.target.value)} />
                  <Input type="number" label="الحد الأقصى للتأخير (دقائق)" value={maxLateMinutes} onChange={(e) => setMaxLateMinutes(e.target.value)} />
                  <Input type="number" label="معدل العمل الإضافي (معامل)" value={overtimeRate} onChange={(e) => setOvertimeRate(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">أيام العمل</label>
                  <div className="flex flex-wrap gap-2">
                    {WORK_DAYS.map((day) => (
                      <button
                        key={day}
                        onClick={() => toggleWorkDay(day)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                          workDays.includes(day)
                            ? "bg-primary/10 text-primary border border-primary/30"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4" />
                    حفظ التغييرات
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payroll Settings */}
          {activeSection === "payroll" && (
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الرواتب</CardTitle>
                <CardDescription>تكوين سياسات الرواتب والمدفوعات.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">دورة الرواتب</label>
                    <Select value={payrollCycle} onValueChange={setPayrollCycle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">شهرية</SelectItem>
                        <SelectItem value="bi-weekly">نصف شهرية</SelectItem>
                        <SelectItem value="weekly">أسبوعية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input type="number" label="يوم الصرف" value={payoutDay} onChange={(e) => setPayoutDay(e.target.value)} />
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">العملة</label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EGP">جنيه مصري</SelectItem>
                        <SelectItem value="USD">دولار أمريكي</SelectItem>
                        <SelectItem value="SAR">ريال سعودي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-foreground">التأمينات الاجتماعية (GOSI)</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input type="number" label="نسبة الموظف (%)" value={gosiEmployeeRate} onChange={(e) => setGosiEmployeeRate(e.target.value)} />
                    <Input type="number" label="نسبة صاحب العمل (%)" value={gosiEmployerRate} onChange={(e) => setGosiEmployerRate(e.target.value)} />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4" />
                    حفظ التغييرات
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Benefits Settings */}
          {activeSection === "benefits" && (
            <Card>
              <CardHeader>
                <CardTitle>المزايا والبدلات</CardTitle>
                <CardDescription>إدارة مزايا الموظفين والبدلات.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">بدل السكن</p>
                      <p className="text-xs text-muted-foreground">راتب شهري إضافي للسكن</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {housingAllowance && (
                        <Input
                          type="number"
                          placeholder="المبلغ"
                          value={housingAmount}
                          onChange={(e) => setHousingAmount(e.target.value)}
                          className="w-32"
                        />
                      )}
                      <button
                        onClick={() => setHousingAllowance(!housingAllowance)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          housingAllowance ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            housingAllowance ? "translate-x-6 rtl:-translate-x-6" : "translate-x-1 rtl:-translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">بدل النقل</p>
                      <p className="text-xs text-muted-foreground">راتب شهري إضافي للنقل</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {transportAllowance && (
                        <Input
                          type="number"
                          placeholder="المبلغ"
                          value={transportAmount}
                          onChange={(e) => setTransportAmount(e.target.value)}
                          className="w-32"
                        />
                      )}
                      <button
                        onClick={() => setTransportAllowance(!transportAllowance)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          transportAllowance ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            transportAllowance ? "translate-x-6 rtl:-translate-x-6" : "translate-x-1 rtl:-translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">تذاكر الطيران السنوية</p>
                      <p className="text-xs text-muted-foreground">تذكرة طيران سنوية للموظفين</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {annualTickets && (
                        <Input
                          type="number"
                          placeholder="المبلغ"
                          value={ticketsAmount}
                          onChange={(e) => setTicketsAmount(e.target.value)}
                          className="w-32"
                        />
                      )}
                      <button
                        onClick={() => setAnnualTickets(!annualTickets)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          annualTickets ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            annualTickets ? "translate-x-6 rtl:-translate-x-6" : "translate-x-1 rtl:-translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">التأمين الطبي</p>
                      <p className="text-xs text-muted-foreground">تغطية تأمين طبي للموظفين</p>
                    </div>
                    <button
                      onClick={() => setMedicalInsurance(!medicalInsurance)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        medicalInsurance ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          medicalInsurance ? "translate-x-6 rtl:-translate-x-6" : "translate-x-1 rtl:-translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4" />
                    حفظ التغييرات
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leave Types */}
          {activeSection === "leave-types" && (
            <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>أنواع الإجازات</CardTitle>
                  <CardDescription>إدارة أنواع الإجازات المتاحة للموظفين.</CardDescription>
                </div>
                <Button size="sm" onClick={() => setLeaveDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                  إضافة
                </Button>
              </CardHeader>
              <CardContent>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الاسم</TableHead>
                        <TableHead className="text-end">الأيام الافتراضية</TableHead>
                        <TableHead>مدفوعة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveTypes.map((lt) => (
                        <TableRow key={lt.id}>
                          <TableCell className="font-medium">{lt.name}</TableCell>
                          <TableCell className="text-end">{lt.defaultDays}</TableCell>
                          <TableCell>
                            <Badge variant={lt.isPaid ? "success" : "default"}>
                              {lt.isPaid ? "مدفوعة" : "غير مدفوعة"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="md:hidden space-y-3">
                  {leaveTypes.map((lt) => (
                    <Card key={lt.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground">{lt.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{lt.defaultDays} يوم</p>
                          </div>
                          <Badge variant={lt.isPaid ? "success" : "default"} className="text-[10px]">
                            {lt.isPaid ? "مدفوعة" : "غير مدفوعة"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loan Types */}
          {activeSection === "loan-types" && (
            <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>أنواع السلف</CardTitle>
                  <CardDescription>إدارة أنواع السلف المتاحة للموظفين.</CardDescription>
                </div>
                <Button size="sm" onClick={() => setLoanDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                  إضافة
                </Button>
              </CardHeader>
              <CardContent>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الاسم</TableHead>
                        <TableHead className="text-end">الحد الأقصى</TableHead>
                        <TableHead className="text-end">نسبة الفائدة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loanTypes.map((lt) => (
                        <TableRow key={lt.id}>
                          <TableCell className="font-medium">{lt.name}</TableCell>
                          <TableCell className="text-end">
                            {lt.maxAmount.toLocaleString("ar-EG")} ج.م
                          </TableCell>
                          <TableCell className="text-end">{lt.interestRate}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="md:hidden space-y-3">
                  {loanTypes.map((lt) => (
                    <Card key={lt.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground">{lt.name}</p>
                          </div>
                          <div className="text-end shrink-0">
                            <p className="text-sm font-medium text-foreground">
                              {lt.maxAmount.toLocaleString("ar-EG")} ج.م
                            </p>
                            <p className="text-xs text-muted-foreground">فائدة: {lt.interestRate}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shifts */}
          {activeSection === "shifts" && (
            <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>الورديات</CardTitle>
                  <CardDescription>إدارة ورديات العمل والجداول الزمنية.</CardDescription>
                </div>
                <Button size="sm" onClick={() => setShiftDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                  إضافة
                </Button>
              </CardHeader>
              <CardContent>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الاسم</TableHead>
                        <TableHead>وقت البداية</TableHead>
                        <TableHead>وقت النهاية</TableHead>
                        <TableHead className="text-end">فترة السماح (دقيقة)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shifts.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell>{s.startTime}</TableCell>
                          <TableCell>{s.endTime}</TableCell>
                          <TableCell className="text-end">{s.graceMinutes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="md:hidden space-y-3">
                  {shifts.map((s) => (
                    <Card key={s.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground">{s.name}</p>
                          </div>
                          <div className="text-end shrink-0">
                            <p className="text-sm text-foreground">
                              {s.startTime} - {s.endTime}
                            </p>
                            <p className="text-xs text-muted-foreground">سماح: {s.graceMinutes} دقيقة</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة نوع إجازة</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input label="اسم نوع الإجازة" value={newLeaveName} onChange={(e) => setNewLeaveName(e.target.value)} />
            <Input type="number" label="الأيام الافتراضية" value={newLeaveDays} onChange={(e) => setNewLeaveDays(e.target.value)} />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">مدفوعة</label>
              <Select value={newLeavePaid ? "yes" : "no"} onValueChange={(v) => setNewLeavePaid(v === "yes")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">نعم</SelectItem>
                  <SelectItem value="no">لا</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaveDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleAddLeaveType} disabled={!newLeaveName}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={loanDialogOpen} onOpenChange={setLoanDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة نوع سلفة</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input label="اسم نوع السلفة" value={newLoanName} onChange={(e) => setNewLoanName(e.target.value)} />
            <Input type="number" label="الحد الأقصى للمبلغ" value={newLoanMax} onChange={(e) => setNewLoanMax(e.target.value)} />
            <Input type="number" label="نسبة الفائدة (%)" value={newLoanRate} onChange={(e) => setNewLoanRate(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoanDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleAddLoanType} disabled={!newLoanName}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={shiftDialogOpen} onOpenChange={setShiftDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة وردية</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input label="اسم الوردية" value={newShiftName} onChange={(e) => setNewShiftName(e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Input type="time" label="وقت البداية" value={newShiftStart} onChange={(e) => setNewShiftStart(e.target.value)} />
              <Input type="time" label="وقت النهاية" value={newShiftEnd} onChange={(e) => setNewShiftEnd(e.target.value)} />
            </div>
            <Input type="number" label="فترة السماح (دقائق)" value={newShiftGrace} onChange={(e) => setNewShiftGrace(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShiftDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleAddShift} disabled={!newShiftName}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
