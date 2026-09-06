"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { PERMISSION_COLUMNS, PERMISSION_MODULES } from "../lib/roles-constants";
import { cn } from "@/lib/utils";
import type { PermissionModuleId, PermissionActionId } from "../types/role.types";

const boxClass =
  "pointer-events-none size-5 rounded-[6px] border-border bg-card shadow-none data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground";

interface PermissionMatrixProps {
  selected: Set<string>;
  disabled?: boolean;
  onToggle: (action: string) => void;
  onSelectAllModules: (moduleIds: PermissionModuleId[]) => void;
  onDeselectAllModules: (moduleIds: PermissionModuleId[]) => void;
  onSelectAllColumns: (actionIds: PermissionActionId[]) => void;
  onDeselectAllColumns: (actionIds: PermissionActionId[]) => void;
  moduleSelections: Record<PermissionModuleId, "all" | "none" | "partial">;
  columnSelections: Record<PermissionActionId, "all" | "none" | "partial">;
}

export function PermissionMatrix({
  selected,
  disabled,
  onToggle,
  onSelectAllModules,
  onDeselectAllModules,
  onSelectAllColumns,
  onDeselectAllColumns,
  moduleSelections,
  columnSelections,
}: PermissionMatrixProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/80">
      <table className="w-full min-w-[700px] caption-bottom text-sm">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="h-12 px-4 text-start text-sm font-medium text-muted-foreground whitespace-nowrap">
              النظام الفرعي / القائمة
            </th>
            {PERMISSION_COLUMNS.map((col) => {
              const state = columnSelections[col.key];
              return (
                <th
                  key={col.key}
                  className="h-12 w-22 px-2 text-center text-sm font-medium text-muted-foreground whitespace-nowrap"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>{col.label}</span>
                    {!disabled && (
                      <button
                        type="button"
                        className="text-[10px] text-primary hover:underline"
                        onClick={() =>
                          state === "all"
                            ? onDeselectAllColumns([col.key])
                            : onSelectAllColumns([col.key])
                        }
                      >
                        {state === "all" ? "إلغاء" : "تحديد الكل"}
                      </button>
                    )}
                  </div>
                </th>
              );
            })}
            <th className="h-12 w-24 px-2 text-center text-sm font-medium text-muted-foreground whitespace-nowrap">
              الإجمالي
            </th>
          </tr>
        </thead>
        <tbody>
          {PERMISSION_MODULES.map((mod) => {
            const state = moduleSelections[mod.id];
            return (
              <tr key={mod.id} className="border-b last:border-0">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{mod.label}</span>
                    {!disabled && (
                      <button
                        type="button"
                        className="text-[10px] text-primary hover:underline"
                        onClick={() =>
                          state === "all"
                            ? onDeselectAllModules([mod.id])
                            : onSelectAllModules([mod.id])
                        }
                      >
                        {state === "all" ? "إلغاء" : "تحديد"}
                      </button>
                    )}
                  </div>
                </td>
                {PERMISSION_COLUMNS.map((col) => {
                  const action = mod.cells[col.key];
                  const mapped = Boolean(action);
                  const checked = mapped ? selected.has(action!) : false;
                  return (
                    <td key={col.key} className="px-2 py-2 text-center">
                      {mapped ? (
                        <button
                          type="button"
                          disabled={disabled}
                          aria-pressed={checked}
                          aria-label={`${mod.label} — ${col.label}`}
                          className={cn(
                            "inline-flex size-9 items-center justify-center rounded-lg",
                            disabled
                              ? "cursor-not-allowed opacity-50"
                              : "hover:bg-primary/10",
                          )}
                          onClick={() => onToggle(action!)}
                        >
                          <Checkbox
                            checked={checked}
                            disabled={disabled}
                            tabIndex={-1}
                            className={boxClass}
                          />
                        </button>
                      ) : (
                        <span className="text-muted-foreground/40" aria-hidden>
                          —
                        </span>
                      )}
                    </td>
                  );
                })}
                <td className="px-2 py-2 text-center text-xs text-muted-foreground">
                  {(() => {
                    let total = 0;
                    let checkedCount = 0;
                    for (const col of PERMISSION_COLUMNS) {
                      const action = mod.cells[col.key];
                      if (action) {
                        total++;
                        if (selected.has(action)) checkedCount++;
                      }
                    }
                    return total > 0 ? `${checkedCount}/${total}` : "—";
                  })()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
