"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarOff,
  DollarSign,
  Landmark,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/hooks/use-auth";

const navigation = [
  { name: "لوحة التحكم", href: "/", icon: LayoutDashboard },
  { name: "الموظفين", href: "/employees", icon: Users },
  { name: "الحضور والانصراف", href: "/attendance", icon: Clock },
  { name: "الإجازات", href: "/leave", icon: CalendarOff },
  { name: "الرواتب", href: "/payroll", icon: DollarSign },
  { name: "السلف", href: "/loans", icon: Landmark },
  { name: "الإعدادات", href: "/settings", icon: Settings },
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

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
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
          <Avatar className="h-8 w-8">
            <AvatarFallback>م</AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export { SidebarLayout, Sidebar };
