"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  CalendarOff,
  FileCheck,
  ClipboardList,
  DollarSign,
  Landmark,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    label: "إدارة الموارد البشرية",
    items: [
      { name: "لوحة التحكم", href: "/", icon: LayoutDashboard },
      { name: "الموظفين", href: "/employees", icon: Users },
      { name: "الأقسام", href: "/departments", icon: Building2 },
      { name: "الحضور والانصراف", href: "/attendance", icon: Clock },
      { name: "الإجازات", href: "/leave", icon: CalendarOff },
    ],
  },
  {
    label: "الطلبات والاعتمادات",
    items: [
      { name: " الطلبات المعلقة", href: "/approvals", icon: FileCheck },
    ],
  },
  {
    label: "إدارة الموارد المالية",
    items: [
      { name: "الرواتب", href: "/payroll", icon: DollarSign },
      { name: "السلف", href: "/loans", icon: Landmark },
    ],
  },
  {
    label: "إدارة النظام",
    items: [
      { name: "الأدوار والصلاحيات", href: "/roles", icon: Shield },
      { name: "الإعدادات", href: "/settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        router.push("/login");
      },
    });
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 flex w-72 flex-col border-s border-border bg-white transition-transform duration-200 dark:bg-muted lg:static lg:translate-x-0",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border ps-6 pe-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary-start)] to-[var(--color-primary-end)]">
              <span className="text-lg font-bold text-white">ق</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-bold text-foreground tracking-tight">قَـــوام</span>
              <span className="text-[11px] font-medium text-muted-foreground">إدارة الموارد البشرية</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navigation.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>م</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : "مدير النظام"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || "admin@qawam.com"}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

interface SidebarLayoutProps {
  children: React.ReactNode;
}

function SidebarLayout({ children }: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-white/80 backdrop-blur-sm px-4 dark:bg-muted/80 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <NotificationBell />
          <Avatar className="h-8 w-8">
            <AvatarFallback>م</AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function NotificationBell() {
  const [open, setOpen] = React.useState(false);
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["notifications", "unread", user?.id],
    queryFn: () => api.get(`/notifications/employee/${user?.id}/unread`),
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const unreadCount = Array.isArray(data) ? data.length : 0;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -start-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute start-0 top-full z-50 mt-2 w-80 rounded-xl border border-border bg-white shadow-lg dark:bg-muted">
            <div className="flex items-center justify-between border-b border-border p-3">
              <h3 className="text-sm font-semibold text-foreground">الإشعارات</h3>
              {unreadCount > 0 && (
                <span className="text-xs text-primary font-medium">{unreadCount} جديد</span>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {Array.isArray(data) && data.length > 0 ? (
                data.map((n: any) => (
                  <div key={n.id} className="border-b border-border p-3 last:border-0">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                  </div>
                ))
              ) : (
                <p className="p-4 text-center text-sm text-muted-foreground">لا توجد إشعارات جديدة</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export { SidebarLayout, Sidebar };
