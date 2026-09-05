"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Loader2,
  Calendar,
  CreditCard,
  Users,
  Download,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toaster";
import { api } from "@/lib/api-client";

interface Report {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
}

interface PayrollCycle {
  id: string;
  month: string;
  year: number;
  status: string;
}

interface ReportSummary {
  totalRecords: number;
  summary: Record<string, number>;
}

const typeConfig: Record<string, { variant: "default" | "success" | "info" | "warning"; label: string; icon: React.ReactNode }> = {
  ATTENDANCE: { variant: "info", label: "تقرير الحضور", icon: <Calendar className="h-3.5 w-3.5" /> },
  PAYROLL: { variant: "success", label: "تقرير الرواتب", icon: <CreditCard className="h-3.5 w-3.5" /> },
  EMPLOYEE: { variant: "default", label: "تقرير الموظفين", icon: <Users className="h-3.5 w-3.5" /> },
};

const statusConfig: Record<string, { variant: "success" | "warning" | "danger"; label: string }> = {
  COMPLETED: { variant: "success", label: "مكتمل" },
  PENDING: { variant: "warning", label: "قيد المعالجة" },
  FAILED: { variant: "danger", label: "فشل" },
};

export function ReportsPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("attendance");
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState<ReportSummary | null>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [payrollCycleId, setPayrollCycleId] = useState("");
  const [payrollCycles, setPayrollCycles] = useState<PayrollCycle[]>([]);
  const [loadingCycles, setLoadingCycles] = useState(false);

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const data = await api.get<Report[]>("/reports");
      setReports(Array.isArray(data) ? data : []);
    } catch {
      addToast({ title: "خطأ", description: "فشل في تحميل التقارير", variant: "danger" });
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchPayrollCycles = async () => {
    setLoadingCycles(true);
    try {
      const data = await api.get<PayrollCycle[]>("/payroll/cycles");
      setPayrollCycles(Array.isArray(data) ? data : []);
    } catch {
      addToast({ title: "خطأ", description: "فشل في تحميل دورات الرواتب", variant: "danger" });
    } finally {
      setLoadingCycles(false);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchPayrollCycles();
  }, []);

  const generateReport = async () => {
    setGenerating(true);
    setSummary(null);
    try {
      let result: ReportSummary;
      if (activeTab === "attendance") {
        if (!startDate || !endDate) {
          addToast({ title: "تنبيه", description: "يرجى اختيار تاريخ البداية والنهاية", variant: "warning" });
          setGenerating(false);
          return;
        }
        result = await api.post<ReportSummary>("/reports/attendance", { startDate, endDate });
      } else if (activeTab === "payroll") {
        if (!payrollCycleId) {
          addToast({ title: "تنبيه", description: "يرجى اختيار دورة الرواتب", variant: "warning" });
          setGenerating(false);
          return;
        }
        result = await api.post<ReportSummary>("/reports/payroll", { payrollCycleId });
      } else {
        result = await api.post<ReportSummary>("/reports/employee");
      }
      setSummary(result);
      addToast({ title: "نجاح", description: "تم إنشاء التقرير بنجاح", variant: "success" });
      fetchReports();
    } catch {
      addToast({ title: "خطأ", description: "فشل في إنشاء التقرير", variant: "danger" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">التقارير</h1>
          <p className="mt-1 text-muted-foreground">
            إنشاء ومراجعة تقارير الحضور والرواتب والموظفين.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="attendance">
            <Calendar className="h-4 w-4" />
            تقرير الحضور
          </TabsTrigger>
          <TabsTrigger value="payroll">
            <CreditCard className="h-4 w-4" />
            تقرير الرواتب
          </TabsTrigger>
          <TabsTrigger value="employee">
            <Users className="h-4 w-4" />
            تقرير الموظفين
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                إنشاء تقرير جديد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TabsContent value="attendance" className="mt-0">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <Input
                      type="date"
                      label="تاريخ البداية"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="date"
                      label="تاريخ النهاية"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <Button onClick={generateReport} disabled={generating} className="sm:w-auto">
                    {generating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    إنشاء التقرير
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="payroll" className="mt-0">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-foreground">دورة الرواتب</label>
                    <Select value={payrollCycleId} onValueChange={setPayrollCycleId}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder={loadingCycles ? "جاري التحميل..." : "اختر دورة الرواتب"} />
                      </SelectTrigger>
                      <SelectContent>
                        {payrollCycles.map((cycle) => (
                          <SelectItem key={cycle.id} value={cycle.id}>
                            {cycle.month} {cycle.year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={generateReport} disabled={generating} className="sm:w-auto">
                    {generating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    إنشاء التقرير
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="employee" className="mt-0">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex-1 text-sm text-muted-foreground">
                    سيتم إنشاء تقرير شامل يحتوي على جميع بيانات الموظفين الحاليين.
                  </div>
                  <Button onClick={generateReport} disabled={generating} className="sm:w-auto">
                    {generating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    إنشاء التقرير
                  </Button>
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </Tabs>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              ملخص التقرير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">إجمالي السجلات</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{summary.totalRecords}</p>
              </div>
              {Object.entries(summary.summary).map(([key, value]) => (
                <div key={key} className="rounded-xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">{key}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>التقارير السابقة</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingReports ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">لا توجد تقارير سابقة</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم التقرير</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead className="text-start">تاريخ الإنشاء</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => {
                      const type = typeConfig[report.type] || typeConfig.ATTENDANCE;
                      const status = statusConfig[report.status] || statusConfig.COMPLETED;
                      return (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.name}</TableCell>
                          <TableCell>
                            <Badge variant={type.variant} className="gap-1">
                              {type.icon}
                              {type.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                          <TableCell className="text-start text-muted-foreground">
                            {new Date(report.createdAt).toLocaleDateString("ar-EG")}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden space-y-3">
                {reports.map((report) => {
                  const type = typeConfig[report.type] || typeConfig.ATTENDANCE;
                  const status = statusConfig[report.status] || statusConfig.COMPLETED;
                  return (
                    <Card key={report.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground truncate">{report.name}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <Badge variant={type.variant} className="gap-1 text-[10px]">
                                {type.icon}
                                {type.label}
                              </Badge>
                              <Badge variant={status.variant} className="text-[10px]">{status.label}</Badge>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {new Date(report.createdAt).toLocaleDateString("ar-EG")}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
