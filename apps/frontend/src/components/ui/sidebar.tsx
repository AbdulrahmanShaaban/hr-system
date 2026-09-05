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
  Calculator,
  CalendarCheck,
  CalendarDays,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

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
    label: "نظرة عامة",
    items: [
      { name: "لوحة التحكم", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "إدارة الموارد البشرية",
    items: [
      { name: "الموظفين", href: "/employees", icon: Users },
      { name: "الأقسام", href: "/departments", icon: Building2 },
      { name: "الحضور والانصراف", href: "/attendance", icon: Clock },
      { name: "الإجازات", href: "/leave", icon: CalendarOff },
    ],
  },
  {
    label: "الطلبات والاعتمادات",
    items: [
      { name: "الطلبات المعلقة", href: "/approvals", icon: FileCheck },
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
      { name: "التقارير", href: "/reports", icon: BarChart3 },
      { name: "الإعدادات", href: "/settings", icon: Settings },
    ],
  },
];

const HEADER_MENU_LINKS = [
  { title: "لوحة التحكم", href: "/", icon: LayoutDashboard },
  { title: "الموظفون", href: "/employees", icon: Users },
  { title: "الحضور", href: "/attendance", icon: CalendarCheck },
  { title: "الإجازات", href: "/leave", icon: CalendarDays },
  { title: "الرواتب", href: "/payroll", icon: Calculator },
  { title: "الإعدادات", href: "/settings", icon: Settings },
] as const;

function arabicInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "؟";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`;
  }
  return name.slice(0, 2);
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        router.push("/login");
      },
    });
  };

  const initials = arabicInitials(
    user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user?.email
  );

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
          "fixed inset-y-0 start-0 z-50 flex w-72 flex-col border-s border-border bg-card transition-transform duration-200 dark:bg-card",
          "lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border ps-6 pe-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
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

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigation.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-muted-foreground">
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
                      onClick={isMobile ? onClose : undefined}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg p-2 text-start transition-colors hover:bg-muted">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : "مدير النظام"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || "admin@qawam.com"}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-52" side="top" sideOffset={8}>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5 text-start">
                  <span className="text-sm font-medium">
                    {user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : "مدير النظام"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="size-4" />
                  الإعدادات
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="size-4" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
  const handleClose = React.useCallback(() => setSidebarOpen(false), []);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const initials = arabicInitials(
    user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user?.email
  );

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        router.push("/login");
      },
    });
  };

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar open={sidebarOpen} onClose={handleClose} />

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card/80 backdrop-blur-sm px-4 dark:bg-card/80 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="فتح القائمة"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative size-9 rounded-full border border-primary/20 bg-primary/15 p-0 hover:bg-primary/20"
                aria-label="قائمة الحساب"
              >
                <Avatar className="size-9">
                  <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-52" sideOffset={8}>
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5 text-start">
                    <span className="text-sm font-medium">
                      {user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : "مستخدم"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {HEADER_MENU_LINKS.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    (item.href !== "/" &&
                      pathname.startsWith(item.href));
                  return (
                    <DropdownMenuItem
                      key={item.href}
                      className={cn(
                        active && "bg-primary/10 text-primary"
                      )}
                      onClick={() => router.push(item.href)}
                    >
                      <Icon className="size-4" />
                      {item.title}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="size-4" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        aria-label={`إشعارات${unreadCount > 0 ? ` (${unreadCount} جديدة)` : ""}`}
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
          <div className="absolute end-0 top-full z-50 mt-2 w-80 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
            <div className="flex items-center justify-between border-b border-border p-3">
              <h3 className="text-sm font-semibold text-foreground">الإشعارات</h3>
              {unreadCount > 0 && (
                <span className="text-xs text-primary font-medium">{unreadCount} جديد</span>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {Array.isArray(data) && data.length > 0 ? (
                data.map((n: { id: string; title: string; message: string }) => (
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

export { SidebarLayout, Sidebar };
