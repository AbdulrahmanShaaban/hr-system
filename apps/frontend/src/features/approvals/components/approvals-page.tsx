"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toaster";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { FileCheck, CheckCircle2, XCircle, Clock } from "lucide-react";
import {
  usePendingApprovals,
  useApproveStep,
  useRejectStep,
} from "../hooks/use-approvals";
import type { ApprovalStep } from "../types/approval.types";

const ENTITY_LABELS: Record<string, string> = {
  leave: "طلب إجازة",
  loan: "طلب سلفة",
  onboarding: "onation تمهيد",
  payroll: "دورة رواتب",
};

export function ApprovalsPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [actionTarget, setActionTarget] = React.useState<{
    step: ApprovalStep;
    action: "approve" | "reject";
  } | null>(null);
  const [comment, setComment] = React.useState("");

  const { data, isLoading } = usePendingApprovals(user?.id || "");
  const approveMutation = useApproveStep();
  const rejectMutation = useRejectStep();

  const steps = Array.isArray(data) ? data : [];

  const handleAction = () => {
    if (!actionTarget) return;

    const mutation =
      actionTarget.action === "approve" ? approveMutation : rejectMutation;

    mutation.mutate(
      { id: actionTarget.step.id, comment: comment || undefined },
      {
        onSuccess: () => {
          addToast({
            title: actionTarget.action === "approve" ? "تم الاعتماد" : "تم الرفض",
            description:
              actionTarget.action === "approve"
                ? "تم اعتماد الطلب بنجاح"
                : "تم رفض الطلب",
          });
          setActionTarget(null);
          setComment("");
        },
        onError: () => {
          addToast({
            title: "خطأ",
            description: "فشلت العملية",
            variant: "danger",
          });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">الاعتمادات المعلقة</h1>
        <p className="text-sm text-muted-foreground">الطلبات المنتظرة للموافقة أو الرفض</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">طلبات تنتظر الاعتماد ({steps.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8 text-muted-foreground">جاري التحميل...</div>
          ) : steps.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">لا توجد طلبات معلقة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-center justify-between rounded-xl border border-border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {ENTITY_LABELS[step.entityType] || step.entityType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        الخطوة {step.stepOrder} • {new Date(step.createdAt).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="warning">
                      <Clock className="ms-1 h-3 w-3" />
                      معلق
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActionTarget({ step, action: "approve" })}
                    >
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActionTarget({ step, action: "reject" })}
                    >
                      <XCircle className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!actionTarget} onOpenChange={() => setActionTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionTarget?.action === "approve" ? "اعتماد الطلب" : "رفض الطلب"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              {actionTarget?.action === "approve"
                ? "هل أنت متأكد من اعتماد هذا الطلب؟"
                : "هل أنت متأكد من رفض هذا الطلب؟"}
            </p>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">ملاحظات (اختياري)</label>
              <Textarea
                placeholder="أضف ملاحظات..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionTarget(null)}>
              إلغاء
            </Button>
            <Button
              variant={actionTarget?.action === "approve" ? "default" : "destructive"}
              onClick={handleAction}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              {actionTarget?.action === "approve" ? "اعتماد" : "رفض"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
