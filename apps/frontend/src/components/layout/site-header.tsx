"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, Home, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";

const segmentLabels: Record<string, string> = {
  employees: "الموظفين",
  departments: "الأقسام",
  attendance: "الحضور والانصراف",
  leave: "الإجازات",
  payroll: "الرواتب",
  loans: "السلف",
  roles: "الأدوار والصلاحيات",
  settings: "الإعدادات",
  reports: "التقارير",
  approvals: "الطلبات المعلقة",
  onboarding: "التمهيد",
  requests: "الطلبات",
  "my-requests": "طلباتي",
  platform: "المنصة",
  companies: "الشركات",
  plans: "خطط الاشتراك",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(s: string): boolean {
  return UUID_RE.test(s);
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [employeeNames, setEmployeeNames] = React.useState<
    Record<string, string>
  >({});

  const segments = pathname.split("/").filter(Boolean);

  const uuidSegments = React.useMemo(
    () => segments.filter(isUuid),
    [segments],
  );

  React.useEffect(() => {
    if (uuidSegments.length === 0) return;
    let cancelled = false;
    (async () => {
      const results = await Promise.allSettled(
        uuidSegments.map(async (seg) => {
          try {
            const data = await api.get<{ name: string }>(`/employees/${seg}`);
            return [seg, data?.name ?? seg] as const;
          } catch {
            return [seg, seg] as const;
          }
        }),
      );
      if (cancelled) return;
      const map: Record<string, string> = {};
      for (const r of results) {
        if (r.status === "fulfilled") map[r.value[0]] = r.value[1];
      }
      setEmployeeNames((prev) => ({ ...prev, ...map }));
    })();
    return () => {
      cancelled = true;
    };
  }, [uuidSegments]);

  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = isUuid(segment)
      ? (employeeNames[segment] ?? "جاري التحميل...")
      : (segmentLabels[segment] ?? segment);
    return { label, href };
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      console.log("Search query:", trimmed);
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 pb-4">
      <nav className="flex items-center gap-1 text-sm" aria-label="أرشيف">
        <Link
          href="/"
          className={cn(
            "flex items-center transition-colors",
            segments.length === 0
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Home className="h-4 w-4" />
        </Link>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <React.Fragment key={crumb.href}>
              <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground rtl:rotate-180" />
              {isLast ? (
                <span className="text-foreground font-medium">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      <form onSubmit={handleSearch} className="relative flex-shrink-0">
        <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث..."
          className="h-9 w-48 rounded-lg border border-border bg-card ps-9 pe-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 lg:w-64"
        />
      </form>
    </div>
  );
}
