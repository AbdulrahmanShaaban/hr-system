"use client";

import * as React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { FormInputProps } from "@/lib/types/form.types";

export function FormInput({
  name,
  label,
  placeholder,
  formType = "input",
  inputType,
  options,
  disabled,
  required,
  password,
  rows,
}: FormInputProps) {
  const { control } = useFormContext();
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive me-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            {formType === "select" ? (
              <Select
                value={field.value ?? ""}
                onValueChange={(v) => {
                  if (v !== null) field.onChange(v);
                }}
                disabled={disabled}
              >
                <SelectTrigger className="h-12! w-full! justify-between rounded-[6px] border border-border bg-card px-4 text-start [&>span]:text-start">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {options?.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="rounded-lg"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : formType === "textarea" ? (
              <Textarea
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                {...field}
              />
            ) : formType === "switch" ? (
              <Switch
                checked={!!field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
            ) : (
              <div className="relative">
                <input
                  type={
                    password
                      ? showPassword
                        ? "text"
                        : "password"
                      : inputType ?? "text"
                  }
                  placeholder={placeholder}
                  disabled={disabled}
                  className="h-12 w-full rounded-[6px] border border-border bg-card px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                  {...field}
                />
                {password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                )}
              </div>
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
