"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"

import { useAuth } from "@/features/auth/hooks/use-auth"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getLocalOnboardingStep,
  setLocalOnboardingStep,
  type OnboardingRouteStep,
} from "@/lib/onboarding/draft"
import {
  dbStepToRoute,
  groupIndex,
  isPostAuthStep,
  isPreAuthStep,
  routeForStep,
  routeStepFromPathname,
  stepIndex,
  type DbOnboardingStep,
} from "@/lib/onboarding/steps"

function allowedPostAuthStep(
  dbRoute: OnboardingRouteStep | null,
  local: OnboardingRouteStep | null,
): OnboardingRouteStep | null {
  const candidates = [dbRoute, local].filter(
    (s): s is OnboardingRouteStep => !!s && isPostAuthStep(s),
  )
  if (!candidates.length) return null
  return candidates.reduce((best, s) =>
    groupIndex(s) > groupIndex(best) ? s : best,
  )
}

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    if (isLoading) return

    const status = isAuthenticated ? "authenticated" : "unauthenticated"

    if (
      status === "authenticated" &&
      user?.onboardingCompletedAt &&
      pathname.startsWith("/onboarding")
    ) {
      router.replace("/dashboard")
      return
    }

    const current = routeStepFromPathname(pathname)
    if (!current) {
      setReady(true)
      return
    }

    const local = getLocalOnboardingStep()

    if (isPreAuthStep(current)) {
      if (!local || stepIndex(current) >= stepIndex(local)) {
        setLocalOnboardingStep(current)
      }
    }

    if (status === "authenticated" && user) {
      const dbRoute = dbStepToRoute(user.onboardingStep as DbOnboardingStep | null)
      if (user.onboardingStep != null && dbRoute) {
        const allowed = allowedPostAuthStep(dbRoute, local) ?? dbRoute

        if (isPreAuthStep(current)) {
          router.replace(routeForStep(allowed))
          return
        }
        if (groupIndex(current) > groupIndex(allowed)) {
          router.replace(routeForStep(allowed))
          return
        }
        setReady(true)
        return
      }

      if (isPostAuthStep(current)) {
        router.replace("/dashboard")
        return
      }
      setReady(true)
      return
    }

    if (isPostAuthStep(current)) {
      router.replace(routeForStep("welcome"))
      return
    }

    const localStep = getLocalOnboardingStep() ?? "welcome"
    if (stepIndex(current) > stepIndex(localStep) + 1) {
      router.replace(routeForStep(localStep))
      return
    }

    setReady(true)
  }, [isAuthenticated, isLoading, user, pathname, router])

  if (isLoading || !ready) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return <>{children}</>
}
