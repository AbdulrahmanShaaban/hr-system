"use client"

import { OnboardingGuard } from "@/components/onboarding/onboarding-guard"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-10">
      <OnboardingGuard>{children}</OnboardingGuard>
    </div>
  )
}
