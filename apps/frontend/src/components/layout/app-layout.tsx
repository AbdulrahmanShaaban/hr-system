"use client";

import React from "react";
import { SidebarLayout } from "@/components/ui/sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
