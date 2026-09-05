"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ShieldCheck, Headphones, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "../hooks/use-auth";

const loginSchema = z.object({
  email: z.string().email("يرجى إدخال بريد إلكتروني صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function OrgStructureSvg() {
  return (
    <svg
      viewBox="0 0 280 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[260px] h-auto"
      aria-hidden="true"
    >
      {/* Top node - CEO/Manager */}
      <rect x="105" y="20" width="70" height="44" rx="12" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <circle cx="125" cy="38" r="7" fill="rgba(255,255,255,0.4)" />
      <rect x="136" y="35" width="24" height="3" rx="1.5" fill="rgba(255,255,255,0.3)" />
      <rect x="136" y="42" width="18" height="2" rx="1" fill="rgba(255,255,255,0.2)" />

      {/* Connecting lines from top */}
      <line x1="140" y1="64" x2="140" y2="80" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <line x1="70" y1="80" x2="210" y2="80" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <line x1="70" y1="80" x2="70" y2="96" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <line x1="140" y1="80" x2="140" y2="96" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <line x1="210" y1="80" x2="210" y2="96" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

      {/* Middle row - 3 departments */}
      <rect x="30" y="96" width="80" height="44" rx="10" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <circle cx="52" cy="114" r="6" fill="rgba(255,255,255,0.35)" />
      <rect x="62" y="111" width="22" height="2.5" rx="1.25" fill="rgba(255,255,255,0.25)" />
      <rect x="62" y="117" width="16" height="2" rx="1" fill="rgba(255,255,255,0.18)" />

      <rect x="100" y="96" width="80" height="44" rx="10" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <circle cx="122" cy="114" r="6" fill="rgba(255,255,255,0.35)" />
      <rect x="132" y="111" width="22" height="2.5" rx="1.25" fill="rgba(255,255,255,0.25)" />
      <rect x="132" y="117" width="16" height="2" rx="1" fill="rgba(255,255,255,0.18)" />

      <rect x="170" y="96" width="80" height="44" rx="10" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <circle cx="192" cy="114" r="6" fill="rgba(255,255,255,0.35)" />
      <rect x="202" y="111" width="22" height="2.5" rx="1.25" fill="rgba(255,255,255,0.25)" />
      <rect x="202" y="117" width="16" height="2" rx="1" fill="rgba(255,255,255,0.18)" />

      {/* Bottom row - 5 team members */}
      <line x1="50" y1="140" x2="50" y2="156" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <line x1="90" y1="140" x2="90" y2="156" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <line x1="140" y1="140" x2="140" y2="156" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <line x1="190" y1="140" x2="190" y2="156" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <line x1="230" y1="140" x2="230" y2="156" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

      <rect x="25" y="156" width="50" height="36" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <circle cx="50" cy="170" r="5" fill="rgba(255,255,255,0.28)" />
      <rect x="38" y="178" width="24" height="2" rx="1" fill="rgba(255,255,255,0.15)" />

      <rect x="65" y="156" width="50" height="36" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <circle cx="90" cy="170" r="5" fill="rgba(255,255,255,0.28)" />
      <rect x="78" y="178" width="24" height="2" rx="1" fill="rgba(255,255,255,0.15)" />

      <rect x="115" y="156" width="50" height="36" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <circle cx="140" cy="170" r="5" fill="rgba(255,255,255,0.28)" />
      <rect x="128" y="178" width="24" height="2" rx="1" fill="rgba(255,255,255,0.15)" />

      <rect x="165" y="156" width="50" height="36" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <circle cx="190" cy="170" r="5" fill="rgba(255,255,255,0.28)" />
      <rect x="178" y="178" width="24" height="2" rx="1" fill="rgba(255,255,255,0.15)" />

      <rect x="205" y="156" width="50" height="36" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <circle cx="230" cy="170" r="5" fill="rgba(255,255,255,0.28)" />
      <rect x="218" y="178" width="24" height="2" rx="1" fill="rgba(255,255,255,0.15)" />

      {/* Decorative dots */}
      <circle cx="20" cy="30" r="2" fill="rgba(255,255,255,0.15)" />
      <circle cx="260" cy="50" r="2.5" fill="rgba(255,255,255,0.12)" />
      <circle cx="240" cy="200" r="2" fill="rgba(255,255,255,0.1)" />
      <circle cx="40" cy="200" r="1.5" fill="rgba(255,255,255,0.1)" />
    </svg>
  );
}

const trustItems = [
  {
    icon: ShieldCheck,
    text: "بيانات آمنة ومشفرة",
  },
  {
    icon: Headphones,
    text: "دعم فني على مدار الساعة",
  },
  {
    icon: Building2,
    text: "موثوق من مئات الشركات",
  },
];

export function LoginForm() {
  const router = useRouter();
  const { login, isLoginPending, loginError, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@acme.com",
      password: "password123",
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-dvh">
      {/* Form side */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
              <span className="text-2xl font-bold text-white">ق</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              مرحباً بك في قَـــوام
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              سجل الدخول للوصول إلى حسابك وإدارة أعمالك بسهولة وأمان.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {loginError && (
              <div className="rounded-lg bg-danger/10 p-3 text-sm text-danger text-center">
                {loginError.message}
              </div>
            )}

            <Input
              label="البريد الإلكتروني"
              type="email"
              placeholder="ahmed@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="كلمة المرور"
              type="password"
              placeholder="أدخل كلمة المرور"
              error={errors.password?.message}
              {...register("password")}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                تذكرني
              </label>
              <a
                href="#"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                نسيت كلمة المرور؟
              </a>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoginPending}
            >
              {isLoginPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Brand panel */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-[var(--color-primary-start)] to-[var(--color-primary-end)] relative overflow-hidden p-12">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />

        <div className="relative z-10 flex flex-col items-center text-center space-y-10">
          {/* Logo and headline */}
          <div className="space-y-5">
            <h2 className="text-4xl font-bold text-white tracking-tight">
              قَـــوام
            </h2>
            <p className="text-xl text-white/90 font-medium leading-relaxed">
              نظام قَـــوام لإدارة الموارد البشرية
              <br />
              والرواتب
            </p>
          </div>

          {/* Illustration */}
          <OrgStructureSvg />

          {/* Trust badges */}
          <div className="flex items-center gap-8 text-white/80">
            {trustItems.map((item) => (
              <div key={item.text} className="flex flex-col items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
