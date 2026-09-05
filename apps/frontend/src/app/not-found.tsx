import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-bold text-foreground">الصفحة غير موجودة</h2>
      <p className="text-muted-foreground">الصفحة التي تبحث عنها غير موجودة.</p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
