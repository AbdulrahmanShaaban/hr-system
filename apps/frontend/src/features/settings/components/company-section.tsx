"use client";

import React, { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CompanySection({ onSave }: { onSave: () => void }) {
  const [companyName, setCompanyName] = useState("شركة قَوام للتكنولوجيا");
  const [companyEmail, setCompanyEmail] = useState("hr@qawam.com");
  const [companyPhone, setCompanyPhone] = useState("+20 123 456 7890");
  const [companyAddress, setCompanyAddress] = useState("القاهرة، مصر");
  const [companyTimezone, setCompanyTimezone] = useState("Africa/Cairo");
  const [companyCurrency, setCompanyCurrency] = useState("EGP");
  const [companyWebsite, setCompanyWebsite] = useState("https://qawam.com");
  const [companyIndustry, setCompanyIndustry] = useState("تقنية المعلومات");

  return (
    <Card>
      <CardHeader>
        <CardTitle>الملف الشخصي للشركة</CardTitle>
        <CardDescription>إدارة معلومات شركتك.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="اسم الشركة" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          <Input label="الموقع الإلكتروني" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} />
          <Input label="البريد الإلكتروني" type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
          <Input label="الهاتف" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
          <Input label="العنوان" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
          <Input label="المجال" value={companyIndustry} onChange={(e) => setCompanyIndustry(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">المنطقة الزمنية</label>
            <Select value={companyTimezone} onValueChange={setCompanyTimezone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Africa/Cairo">القاهرة (UTC+2)</SelectItem>
                <SelectItem value="Asia/Dubai">دبي (UTC+4)</SelectItem>
                <SelectItem value="Europe/London">لندن (UTC+0)</SelectItem>
                <SelectItem value="America/New_York">نيويورك (UTC-5)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">العملة</label>
            <Select value={companyCurrency} onValueChange={setCompanyCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EGP">جنيه مصري</SelectItem>
                <SelectItem value="USD">دولار أمريكي</SelectItem>
                <SelectItem value="AED">درهم إماراتي</SelectItem>
                <SelectItem value="SAR">ريال سعودي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onSave}>
            <Save className="h-4 w-4" />
            حفظ التغييرات
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
