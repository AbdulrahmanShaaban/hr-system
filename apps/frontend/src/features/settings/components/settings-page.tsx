"use client";

import React, { useState } from "react";
import { Building2, Calendar, Banknote, Clock, Shield } from "lucide-react";
import { CompanySection } from "./company-section";
import { AttendanceSection } from "./attendance-section";
import { PayrollSection } from "./payroll-section";
import { BenefitsSection } from "./benefits-section";
import { LeaveTypesSection } from "./leave-types-section";
import { LoanTypesSection } from "./loan-types-section";
import { ShiftsSection } from "./shifts-section";
import { useToast } from "@/components/ui/toaster";

interface SettingsSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const sections: SettingsSection[] = [
  { id: "company", label: "الملف الشخصي للشركة", icon: <Building2 className="h-4 w-4" /> },
  { id: "attendance", label: "إعدادات الحضور", icon: <Clock className="h-4 w-4" /> },
  { id: "payroll", label: "إعدادات الرواتب", icon: <Banknote className="h-4 w-4" /> },
  { id: "benefits", label: "المزايا والبدلات", icon: <Shield className="h-4 w-4" /> },
  { id: "leave-types", label: "أنواع الإجازات", icon: <Calendar className="h-4 w-4" /> },
  { id: "loan-types", label: "أنواع السلف", icon: <Banknote className="h-4 w-4" /> },
  { id: "shifts", label: "الورديات", icon: <Clock className="h-4 w-4" /> },
];

export function SettingsPage() {
  const { addToast } = useToast();
  const [activeSection, setActiveSection] = useState("company");

  const handleSave = () => {
    addToast({ title: "تم بنجاح", description: "تم حفظ الإعدادات بنجاح", variant: "success" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">الإعدادات</h1>
        <p className="mt-1 text-muted-foreground">
          تكوين إعدادات مؤسستك وتفضيلاتها.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex lg:w-56 flex-row lg:flex-col gap-1 overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeSection === section.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0">
          {activeSection === "company" && <CompanySection onSave={handleSave} />}
          {activeSection === "attendance" && <AttendanceSection onSave={handleSave} />}
          {activeSection === "payroll" && <PayrollSection onSave={handleSave} />}
          {activeSection === "benefits" && <BenefitsSection onSave={handleSave} />}
          {activeSection === "leave-types" && <LeaveTypesSection onSave={handleSave} />}
          {activeSection === "loan-types" && <LoanTypesSection onSave={handleSave} />}
          {activeSection === "shifts" && <ShiftsSection onSave={handleSave} />}
        </div>
      </div>
    </div>
  );
}
