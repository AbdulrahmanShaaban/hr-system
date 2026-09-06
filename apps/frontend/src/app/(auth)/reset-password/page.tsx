"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Check } from "lucide-react";

import {
  clearForgotPasswordSession,
  getForgotPasswordResetToken,
  isForgotPasswordVerified,
  resetPassword,
} from "@/lib/auth/forgot-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthBackLink, AuthFormShell } from "@/components/auth/auth-form-shell";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
      .regex(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "يجب أن تحتوي على حرف صغير وكبير ورقم"
      ),
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const REDIRECT_MS = 3000;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);
  const [successOpen, setSuccessOpen] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onChange",
  });

  React.useEffect(() => {
    if (!isForgotPasswordVerified()) {
      router.replace("/forgot-password");
      return;
    }
    setReady(true);
  }, [router]);

  const resetMutation = useMutation({
    mutationFn: ({
      resetToken,
      password,
    }: {
      resetToken: string;
      password: string;
    }) => resetPassword(resetToken, password),
    onSuccess: () => {
      clearForgotPasswordSession();
      setSuccessOpen(true);
    },
  });

  React.useEffect(() => {
    if (!successOpen) return;
    const id = window.setTimeout(() => {
      router.replace("/login");
    }, REDIRECT_MS);
    return () => window.clearTimeout(id);
  }, [successOpen, router]);

  if (!ready) {
    return (
      <AuthFormShell>
        <p className="text-center text-sm text-muted-foreground">جارٍ التحميل…</p>
      </AuthFormShell>
    );
  }

  const busy = resetMutation.isPending || successOpen;

  return (
    <AuthFormShell>
      <AuthBackLink href="/forgot-password" className="mb-8 self-start" />

      <header className="mb-8 text-right">
        <h1 className="font-sans text-[32px] font-bold leading-[1.2] text-foreground">
          إعادة تعيين كلمة{" "}
          <span className="text-primary">المرور</span>
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          أنشئ كلمة مرور جديدة لحسابك. احرص على اختيار كلمة مرور قوية للحفاظ على
          أمان حسابك.
        </p>
      </header>

      <form
        onSubmit={handleSubmit((values) => {
          const resetToken = getForgotPasswordResetToken();
          if (!resetToken) {
            router.replace("/forgot-password");
            return;
          }
          resetMutation.mutate({
            resetToken,
            password: values.password,
          });
        })}
        className="flex flex-col gap-5"
        noValidate
      >
        <Input
          label="كلمة المرور"
          type="password"
          placeholder="أدخل كلمة المرور"
          error={errors.password?.message}
          disabled={busy}
          {...register("password")}
        />

        <Input
          label="تأكيد كلمة المرور"
          type="password"
          placeholder="أعد إدخال كلمة المرور"
          error={errors.confirmPassword?.message}
          disabled={busy}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          disabled={!isValid || busy}
          className="mt-2 h-12 w-full"
          size="lg"
        >
          {resetMutation.isPending ? "جارٍ التغيير…" : "تغيير كلمة المرور"}
        </Button>
      </form>

      <AlertDialog
        open={successOpen}
        onOpenChange={(open) => {
          if (open) setSuccessOpen(true);
        }}
      >
        <AlertDialogContent className="max-w-[340px] gap-3 rounded-2xl px-6 py-8 shadow-xl">
          <AlertDialogHeader className="place-items-center gap-4 text-center">
            <div className="mb-0 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Check className="size-7" strokeWidth={2.75} />
            </div>
            <div className="space-y-2">
              <AlertDialogTitle className="text-center text-base font-bold leading-relaxed text-foreground">
                تم تغيير كلمة المرور بنجاح
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-sm leading-relaxed text-muted-foreground">
                سيتم نقلك إلى صفحة تسجيل الدخول تلقائياً
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </AuthFormShell>
  );
}
