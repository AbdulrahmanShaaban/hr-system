import { apiFetch } from "@/lib/api/apiFetch"
import {
  setLocalOnboardingStep,
  type OnboardingRouteStep,
} from "@/lib/onboarding/draft"
import {
  routeToDbStep,
  type DbOnboardingStep,
} from "@/lib/onboarding/steps"

export async function advanceOnboardingTo(
  next: OnboardingRouteStep,
  refreshSession?: () => Promise<void>,
) {
  const dbStep = routeToDbStep(next)
  if (dbStep) {
    await apiFetch<{ step: DbOnboardingStep | null; completedAt: string | null }>(
      "/onboarding/state",
      { method: "PATCH", body: { step: dbStep } },
    )
  }
  setLocalOnboardingStep(next)
  if (refreshSession) {
    await refreshSession()
  }
}
