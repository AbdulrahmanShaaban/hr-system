"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  Check,
  ClipboardList,
  Users,
  FileText,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface TemplateStep {
  stepName: string;
  description?: string;
}

interface Template {
  id: string;
  name: string;
  steps: TemplateStep[];
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string | { id: string; name: string; [key: string]: unknown };
}

interface OnboardingStep {
  id: string;
  stepName: string;
  description?: string;
  completed: boolean;
}

export function OnboardingPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("templates");

  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateSteps, setTemplateSteps] = useState<TemplateStep[]>([
    { stepName: "", description: "" },
  ]);
  const [creatingTemplate, setCreatingTemplate] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [startingOnboarding, setStartingOnboarding] = useState(false);

  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([]);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [completingStepId, setCompletingStepId] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setTemplatesLoading(true);
      const data = await api.get<Template[]>("/onboarding/templates");
      setTemplates(data);
    } catch {
      addToast({
        title: "خطأ",
        description: "فشل في تحميل القوالب",
        variant: "danger",
      });
    } finally {
      setTemplatesLoading(false);
    }
  }, [addToast]);

  const fetchEmployees = useCallback(async () => {
    try {
      setEmployeesLoading(true);
      const data = await api.get<{ data: Employee[]; total: number }>(
        "/employees"
      );
      setEmployees(data.data);
    } catch {
      addToast({
        title: "خطأ",
        description: "فشل في تحميل الموظفين",
        variant: "danger",
      });
    } finally {
      setEmployeesLoading(false);
    }
  }, [addToast]);

  const fetchOnboardingSteps = useCallback(
    async (employeeId: string) => {
      try {
        setOnboardingLoading(true);
        const data = await api.get<{ steps: OnboardingStep[] }>(
          `/onboarding/employee/${employeeId}`
        );
        setOnboardingSteps(data.steps || []);
      } catch {
        setOnboardingSteps([]);
      } finally {
        setOnboardingLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchTemplates();
    fetchEmployees();
  }, [fetchTemplates, fetchEmployees]);

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchOnboardingSteps(selectedEmployeeId);
    } else {
      setOnboardingSteps([]);
    }
  }, [selectedEmployeeId, fetchOnboardingSteps]);

  const handleCreateTemplate = async () => {
    if (!templateName.trim() || templateSteps.some((s) => !s.stepName.trim())) {
      addToast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "warning",
      });
      return;
    }

    try {
      setCreatingTemplate(true);
      await api.post("/onboarding/templates", {
        name: templateName.trim(),
        steps: templateSteps.map((s) => ({
          stepName: s.stepName.trim(),
          description: s.description?.trim() || undefined,
        })),
      });
      addToast({
        title: "نجاح",
        description: "تم إنشاء القالب بنجاح",
        variant: "success",
      });
      setCreateDialogOpen(false);
      setTemplateName("");
      setTemplateSteps([{ stepName: "", description: "" }]);
      fetchTemplates();
    } catch {
      addToast({
        title: "خطأ",
        description: "فشل في إنشاء القالب",
        variant: "danger",
      });
    } finally {
      setCreatingTemplate(false);
    }
  };

  const handleStartOnboarding = async () => {
    if (!selectedEmployeeId || !selectedTemplateId) {
      addToast({
        title: "خطأ",
        description: "يرجى اختيار الموظف والقالب",
        variant: "warning",
      });
      return;
    }

    try {
      setStartingOnboarding(true);
      await api.post("/onboarding/start", {
        employeeId: selectedEmployeeId,
        templateId: selectedTemplateId,
      });
      addToast({
        title: "نجاح",
        description: "تم بدء التأهيل بنجاح",
        variant: "success",
      });
      fetchOnboardingSteps(selectedEmployeeId);
    } catch {
      addToast({
        title: "خطأ",
        description: "فشل في بدء التأهيل",
        variant: "danger",
      });
    } finally {
      setStartingOnboarding(false);
    }
  };

  const handleCompleteStep = async (stepId: string) => {
    if (!selectedEmployeeId) return;

    try {
      setCompletingStepId(stepId);
      await api.post(`/onboarding/steps/${stepId}/complete`, {
        employeeId: selectedEmployeeId,
      });
      addToast({
        title: "نجاح",
        description: "تم إكمال الخطوة بنجاح",
        variant: "success",
      });
      fetchOnboardingSteps(selectedEmployeeId);
    } catch {
      addToast({
        title: "خطأ",
        description: "فشل في إكمال الخطوة",
        variant: "danger",
      });
    } finally {
      setCompletingStepId(null);
    }
  };

  const addStep = () => {
    setTemplateSteps([...templateSteps, { stepName: "", description: "" }]);
  };

  const removeStep = (index: number) => {
    if (templateSteps.length <= 1) return;
    setTemplateSteps(templateSteps.filter((_, i) => i !== index));
  };

  const updateStep = (
    index: number,
    field: keyof TemplateStep,
    value: string
  ) => {
    const updated = [...templateSteps];
    updated[index] = { ...updated[index], [field]: value };
    setTemplateSteps(updated);
  };

  const completedCount = onboardingSteps.filter((s) => s.completed).length;
  const totalCount = onboardingSteps.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          التأهيل
        </h1>
        <p className="mt-1 text-muted-foreground">
          إدارة قوالب التأهيل وبدء عملية تأهيل الموظفين الجدد.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              القوالب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                {templates.length}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              خطوات مكتملة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-success" />
              <span className="text-2xl font-bold text-foreground">
                {completedCount}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الخطوات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-warning" />
              <span className="text-2xl font-bold text-foreground">
                {totalCount}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            القوالب
          </TabsTrigger>
          <TabsTrigger value="employee" className="gap-2">
            <Users className="h-4 w-4" />
            تأهيل موظف
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>قوالب التأهيل</CardTitle>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                قالب جديد
              </Button>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : templates.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  لا توجد قوالب بعد
                </div>
              ) : (
                <>
                  <div className="hidden md:block">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="py-3 text-start text-sm font-medium text-muted-foreground">
                              اسم القالب
                            </th>
                            <th className="py-3 text-start text-sm font-medium text-muted-foreground">
                              عدد الخطوات
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {templates.map((template) => (
                            <tr
                              key={template.id}
                              className="border-b border-border last:border-0"
                            >
                              <td className="py-3 font-medium text-foreground">
                                {template.name}
                              </td>
                              <td className="py-3">
                                <Badge variant="info">
                                  {template.steps.length} خطوات
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="md:hidden space-y-3">
                    {templates.map((template) => (
                      <Card key={template.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-foreground">
                              {template.name}
                            </p>
                            <Badge variant="info">
                              {template.steps.length} خطوات
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employee">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>بدء التأهيل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      الموظف
                    </label>
                    <Select
                      value={selectedEmployeeId}
                      onValueChange={setSelectedEmployeeId}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            employeesLoading
                              ? "جاري التحميل..."
                              : "اختر موظف"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      القالب
                    </label>
                    <Select
                      value={selectedTemplateId}
                      onValueChange={setSelectedTemplateId}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            templatesLoading
                              ? "جاري التحميل..."
                              : "اختر قالب"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((tpl) => (
                          <SelectItem key={tpl.id} value={tpl.id}>
                            {tpl.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={handleStartOnboarding}
                    disabled={
                      !selectedEmployeeId ||
                      !selectedTemplateId ||
                      startingOnboarding
                    }
                  >
                    {startingOnboarding && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    بدء التأهيل
                  </Button>
                </div>
              </CardContent>
            </Card>

            {selectedEmployeeId && (
              <Card>
                <CardHeader>
                  <CardTitle>خطوات التأهيل</CardTitle>
                </CardHeader>
                <CardContent>
                  {onboardingLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : onboardingSteps.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      لا توجد خطوات تأهيل. اختر قالباً وابدأ التأهيل.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            التقدم
                          </span>
                          <span className="font-medium text-foreground">
                            {completedCount} / {totalCount} ({progressPercent}
                            %)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-success transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        {onboardingSteps.map((step, index) => (
                          <div
                            key={step.id}
                            className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                              step.completed
                                ? "border-success/30 bg-success/5"
                                : "border-border"
                            }`}
                          >
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                step.completed
                                  ? "bg-success text-white"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {step.completed ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                index + 1
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className={`font-medium ${
                                  step.completed
                                    ? "text-success line-through"
                                    : "text-foreground"
                                }`}
                              >
                                {step.stepName}
                              </p>
                              {step.description && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {step.description}
                                </p>
                              )}
                            </div>
                            {!step.completed && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCompleteStep(step.id)}
                                disabled={completingStepId === step.id}
                              >
                                {completingStepId === step.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                                إكمال
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>إنشاء قالب تأهيل</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              label="اسم القالب"
              placeholder="مثال: تأهيل المطورين"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                خطوات التأهيل
              </label>
              {templateSteps.map((step, index) => (
                <div key={index} className="space-y-2 rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      الخطوة {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(index)}
                      disabled={templateSteps.length <= 1}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="اسم الخطوة"
                    value={step.stepName}
                    onChange={(e) =>
                      updateStep(index, "stepName", e.target.value)
                    }
                  />
                  <Input
                    placeholder="الوصف (اختياري)"
                    value={step.description || ""}
                    onChange={(e) =>
                      updateStep(index, "description", e.target.value)
                    }
                  />
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addStep}
                className="w-full"
              >
                <Plus className="h-4 w-4" />
                إضافة خطوة
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleCreateTemplate}
              disabled={creatingTemplate}
            >
              {creatingTemplate && <Loader2 className="h-4 w-4 animate-spin" />}
              إنشاء القالب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
