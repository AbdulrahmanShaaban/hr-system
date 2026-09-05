"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Users, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";

interface SearchResult {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  status: string;
}

const statusConfig: Record<string, { variant: "success" | "warning" | "danger" | "default"; label: string }> = {
  active: { variant: "success", label: "نشط" },
  "on-leave": { variant: "warning", label: "في إجازة" },
  inactive: { variant: "danger", label: "غير نشط" },
};

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          <div className="h-3 w-24 rounded bg-muted animate-pulse" />
          <div className="h-3 w-20 rounded bg-muted animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const data = await api.get<SearchResult[]>("/search/employees", {
        params: { q: q.trim() },
      });
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query, performSearch]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">بحث</h1>
        <p className="mt-1 text-muted-foreground">
          البحث عن موظفين في النظام.
        </p>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute end-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="اكتب اسم الموظف..."
          className="text-base ps-11"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !searched ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-sm text-muted-foreground">
            ابدأ البحث عن موظفين
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-sm text-muted-foreground">
            لم يتم العثور على نتائج
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((result) => {
            const config = statusConfig[result.status] || statusConfig.active;
            return (
              <Card key={result.id}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">
                      {result.firstName} {result.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{result.position}</p>
                    <p className="text-sm text-muted-foreground">{result.department}</p>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
