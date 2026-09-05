"use client"

import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED"

type LeaveRequest = {
  id: string
  employeeName: string
  position: string | null
  status: LeaveStatus
  fromDate: string
  toDate: string
}

const STATUS_UI: Record<
  LeaveStatus,
  { label: string; className: string }
> = {
  APPROVED: {
    label: "موافق عليها",
    className: "bg-primary/15 text-primary",
  },
  PENDING: {
    label: "معلق",
    className: "bg-warning/10 text-warning",
  },
  REJECTED: {
    label: "مرفوضة",
    className: "bg-destructive/10 text-destructive",
  },
}

function arabicInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`
  }
  return name.slice(0, 2) || "؟"
}

const placeholderLeaves: LeaveRequest[] = [
  { id: "1", employeeName: "أحمد حسن", position: "مهندس برمجيات", status: "PENDING", fromDate: "2025-11-15", toDate: "2025-11-17" },
  { id: "2", employeeName: "سارة علي", position: "مديرة موارد بشرية", status: "APPROVED", fromDate: "2025-11-20", toDate: "2025-11-22" },
  { id: "3", employeeName: "محمد خالد", position: "محاسب", status: "PENDING", fromDate: "2025-11-25", toDate: "2025-11-26" },
]

export function LeaveList() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">طلبات الإجازة</CardTitle>
        <Link
          href="/leave"
          className="text-xs font-medium text-primary hover:underline"
        >
          عرض الكل
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {placeholderLeaves.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            لا توجد طلبات إجازة
          </p>
        ) : (
          placeholderLeaves.map((row) => {
            const ui = STATUS_UI[row.status]
            return (
              <div
                key={row.id}
                className="flex items-center gap-3 rounded-xl border border-border/60 px-3 py-2.5"
              >
                <Avatar className="size-9 bg-primary/10">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {arabicInitials(row.employeeName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {row.employeeName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {row.position || "—"}
                  </p>
                </div>
                <Badge className={ui.className}>{ui.label}</Badge>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
