"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useApproveRequest, useRejectRequest } from "../hooks/use-requests";
import type { RequestItem } from "../types/request.types";
import {
  STATUS_AR,
  TYPE_AR,
  STATUS_BADGE_VARIANT,
} from "../types/request.types";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface RequestDetailDialogProps {
  request: RequestItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canApprove?: boolean;
}

export function RequestDetailDialog({
  request,
  open,
  onOpenChange,
  canApprove = false,
}: RequestDetailDialogProps) {
  const [reviewNote, setReviewNote] = React.useState("");
  const [actionType, setActionType] = React.useState<
    "approve" | "reject" | null
  >(null);

  const approveMutation = useApproveRequest();
  const rejectMutation = useRejectRequest();

  React.useEffect(() => {
    if (!open) {
      setReviewNote("");
      setActionType(null);
    }
  }, [open]);

  function handleAction() {
    if (!request || !actionType) return;

    const mutation =
      actionType === "approve" ? approveMutation : rejectMutation;

    mutation.mutate(
      { id: request.id, reviewNote: reviewNote || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  }

  const isPending =
    approveMutation.isPending || rejectMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>تفاصيل الطلب</DialogTitle>
        </DialogHeader>

        {request && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">النوع</p>
                <p className="text-sm font-medium">{TYPE_AR[request.type]}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">الحالة</p>
                <Badge
                  variant={STATUS_BADGE_VARIANT[request.status as keyof typeof STATUS_BADGE_VARIANT]}
                >
                  {STATUS_AR[request.status]}
                </Badge>
              </div>
              {request.type === "OVERTIME" && (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      التاريخ
                    </p>
                    <p className="text-sm font-medium">
                      {request.date || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      الساعات
                    </p>
                    <p className="text-sm font-medium">
                      {request.hours ?? "—"} ساعة
                    </p>
                  </div>
                </>
              )}
              {request.type === "GENERAL" && request.title && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">
                    العنوان
                  </p>
                  <p className="text-sm font-medium">{request.title}</p>
                </div>
              )}
              {request.reason && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">
                    السبب
                  </p>
                  <p className="text-sm">{request.reason}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  مستوى الموافقة
                </p>
                <p className="text-sm font-medium">
                  المستوى {request.approvalLevel}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  تاريخ الإنشاء
                </p>
                <p className="text-sm font-medium">
                  {new Date(request.createdAt).toLocaleDateString("ar-EG")}
                </p>
              </div>
            </div>

            {canApprove &&
              (request.status === "PENDING" ||
                request.status === "IN_REVIEW") && (
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="space-y-2">
                    <Label>ملاحظات (اختياري)</Label>
                    <Textarea
                      placeholder="أضف ملاحظات..."
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      className="flex-1"
                      disabled={isPending}
                      onClick={() => {
                        setActionType("approve");
                        handleAction();
                      }}
                    >
                      <CheckCircle2 className="ms-1 h-4 w-4" />
                      موافقة
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      disabled={isPending}
                      onClick={() => {
                        setActionType("reject");
                        handleAction();
                      }}
                    >
                      <XCircle className="ms-1 h-4 w-4" />
                      رفض
                    </Button>
                  </div>
                </div>
              )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
