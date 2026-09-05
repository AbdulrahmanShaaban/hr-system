"use client";

import React, { useState } from "react";
import { Loader2, Plus, Building2, Calendar, Banknote, Clock } from "lucide-react";
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

interface SettingsSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const sections: SettingsSection[] = [
  { id: "company", label: "الملف الشخصي للشركة", icon: <Building2 className="h-4 w-4" /> },
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

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState("company");

  const [companyName, setCompanyName] = useState("شركة قَوام للتكنولوجيا");
  const [companyEmail, setCompanyEmail] = useState("hr@qawam.com");
  const [companyPhone, setCompanyPhone] = useState("+20 123 456 7890");
  const [companyAddress, setCompanyAddress] = useState("القاهرة، مصر");
  const [companyTimezone, setCompanyTimezone] = useState("Africa/Cairo");
  const [companyCurrency, setCompanyCurrency] = useState("EGP");

  const [leaveTypes, setLeaveTypes] = useState(placeholderLeaveTypes);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [newLeaveName, setNewLeaveName] = useState("");
  const [newLeaveDays, setNewLeaveDays] = useState("");
  const [newLeavePaid, setNewLeavePaid] = useState(true);

  const [loanTypes, setLoanTypes] = useState(placeholderLoanTypes);
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [newLoanName, setNewLoanName] = useState("");
  const [newLoanMax, setNewLoanMax] = useState("");
  const [newLoanRate, setNewLoanRate] = useState("");

  const [shifts, setShifts] = useState(placeholderShifts);
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [newShiftName, setNewShiftName] = useState("");
  const [newShiftStart, setNewShiftStart] = useState("");
  const [newShiftEnd, setNewShiftEnd] = useState("");
  const [newShiftGrace, setNewShiftGrace] = useState("");

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
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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

        <div className="flex-1">
          {activeSection === "company" && (
            <Card>
              <CardHeader>
                <CardTitle>الملف الشخصي للشركة</CardTitle>
                <CardDescription>إدارة معلومات شركتك.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="اسم الشركة" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                  <Input label="البريد الإلكتروني" type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
                  <Input label="الهاتف" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
                  <Input label="العنوان" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
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
                  <Button>حفظ التغييرات</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "leave-types" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
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
              </CardContent>
            </Card>
          )}

          {activeSection === "loan-types" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
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
              </CardContent>
            </Card>
          )}

          {activeSection === "shifts" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
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
              </CardContent>
            </Card>
          )}
        </div>
      </div>

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
