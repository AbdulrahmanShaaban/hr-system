import { apiFetch } from "@/lib/api/apiFetch"
import { formatTime12h } from "@/lib/format-time"
import type { ComboboxOption } from "@/components/ui/combobox"

type NamedRow = { id: string; name: string }

type PageMeta = {
  page: number
  limit: number
  itemCount: number
  pageCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export type ComboboxPage = {
  data: ComboboxOption[]
  meta: { pageCount: number; itemCount: number }
}

function toPage(res: { data: NamedRow[]; meta: PageMeta }): ComboboxPage {
  return {
    data: (res.data ?? []).map((r) => ({ value: r.id, label: r.name })),
    meta: {
      pageCount: res.meta?.pageCount ?? 1,
      itemCount: res.meta?.itemCount ?? res.data?.length ?? 0,
    },
  }
}

export async function fetchEmployeeOptions(params: {
  page: number
  limit: number
  search?: string
  managersOnly?: boolean
}): Promise<ComboboxPage> {
  const qs = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    orderBy: "name",
    order: "asc",
    accountStatus: "ACTIVE",
  })
  if (params.search) qs.set("search", params.search)
  if (params.managersOnly) qs.set("managersOnly", "true")
  const res = await apiFetch<{ data: NamedRow[]; meta: PageMeta }>(
    `/employees?${qs}`,
  )
  return toPage(res)
}

export async function fetchEmployeeOption(
  id: string,
): Promise<ComboboxOption | null> {
  try {
    const emp = await apiFetch<NamedRow>(`/employees/${id}`)
    return { value: emp.id, label: emp.name }
  } catch {
    return null
  }
}

export async function fetchDepartmentOptions(params: {
  page: number
  limit: number
  search?: string
}): Promise<ComboboxPage> {
  const qs = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    orderBy: "name",
    order: "asc",
  })
  if (params.search) qs.set("search", params.search)
  const res = await apiFetch<{ data: NamedRow[]; meta: PageMeta }>(
    `/departments?${qs}`,
  )
  return toPage(res)
}

export async function fetchDepartmentOption(
  id: string,
): Promise<ComboboxOption | null> {
  try {
    const dep = await apiFetch<NamedRow>(`/departments/${id}`)
    return { value: dep.id, label: dep.name }
  } catch {
    return null
  }
}

type ShiftRow = {
  id: string
  name: string
  startTime: string
  endTime: string
}

export async function fetchShiftOptions(params: {
  page: number
  limit: number
  search?: string
}): Promise<ComboboxPage> {
  const qs = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    orderBy: "name",
    order: "asc",
  })
  if (params.search) qs.set("search", params.search)
  const res = await apiFetch<{ data: ShiftRow[]; meta: PageMeta }>(
    `/shifts?${qs}`,
  )
  return {
    data: (res.data ?? []).map((s) => ({
      value: s.id,
      label: `${s.name} (${formatTime12h(s.startTime)} – ${formatTime12h(s.endTime)})`,
    })),
    meta: {
      pageCount: res.meta?.pageCount ?? 1,
      itemCount: res.meta?.itemCount ?? res.data?.length ?? 0,
    },
  }
}

export async function fetchShiftOption(
  id: string,
): Promise<ComboboxOption | null> {
  try {
    const s = await apiFetch<ShiftRow>(`/shifts/${id}`)
    return {
      value: s.id,
      label: `${s.name} (${formatTime12h(s.startTime)} – ${formatTime12h(s.endTime)})`,
    }
  } catch {
    return null
  }
}
