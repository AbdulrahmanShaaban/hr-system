"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Trash2, Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";

interface Notification {
  id: string;
  employeeId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const typeConfig: Record<string, { variant: "info" | "warning" | "success" | "danger"; label: string }> = {
  info: { variant: "info", label: "معلومات" },
  warning: { variant: "warning", label: "تحذير" },
  success: { variant: "success", label: "نجاح" },
  error: { variant: "danger", label: "خطأ" },
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffDay > 0) return `منذ ${diffDay} يوم`;
  if (diffHr > 0) return `منذ ${diffHr} ساعة`;
  if (diffMin > 0) return `منذ ${diffMin} دقيقة`;
  return "الآن";
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { addToast } = useToast();

  const employeeId = "me";

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Notification[]>(`/notifications/employee/${employeeId}`);
      setNotifications(res);
    } catch {
      addToast({ title: "خطأ", description: "فشل تحميل الإشعارات", variant: "danger" });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    setProcessingId(id);
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      addToast({ title: "خطأ", description: "فشل تحديث الإشعار", variant: "danger" });
    } finally {
      setProcessingId(null);
    }
  };

  const markAllAsRead = async () => {
    setProcessingId("all");
    try {
      await api.post(`/notifications/employee/${employeeId}/read-all`);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      addToast({ title: "تم", description: "تم تحديد جميع الإشعارات كمقروءة", variant: "success" });
    } catch {
      addToast({ title: "خطأ", description: "فشل تحديث الإشعارات", variant: "danger" });
    } finally {
      setProcessingId(null);
    }
  };

  const deleteNotification = async (id: string) => {
    setProcessingId(id);
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      addToast({ title: "خطأ", description: "فشل حذف الإشعار", variant: "danger" });
    } finally {
      setProcessingId(null);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">الإشعارات</h1>
          <p className="mt-1 text-muted-foreground">
            إدارة إشعاراتك ومتابعة التحديثات.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={processingId === "all"}
          >
            {processingId === "all" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            تحديد الكل كمقروء
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>جميع الإشعارات ({notifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Bell className="mx-auto h-12 w-12 opacity-30 mb-3" />
              لا توجد إشعارات
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => {
                const config = typeConfig[notification.type] ?? { variant: "info" as const, label: notification.type };
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                      !notification.isRead
                        ? "bg-primary/5 border-s-2 border-primary"
                        : "border-border"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${!notification.isRead ? "font-semibold" : "font-medium"}`}>
                          {notification.title}
                        </p>
                        <Badge variant={config.variant} className="text-[10px] shrink-0">
                          {config.label}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {timeAgo(notification.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          disabled={processingId === notification.id}
                          aria-label="تحديد كمقروء"
                        >
                          {processingId === notification.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCheck className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        disabled={processingId === notification.id}
                        aria-label="حذف"
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
