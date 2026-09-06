export const RTL_FORM_FIELD = "text-right"
export const RTL_LABEL = "text-right block"
export const RTL_SELECT = "text-right"
export const RTL_INPUT = "text-right"
export const RTL_TEXTAREA = "text-right"

export function rtlFieldClasses(error?: string): string {
  const base = "text-right"
  return error ? `${base} border-destructive` : base
}
