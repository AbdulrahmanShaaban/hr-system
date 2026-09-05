"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  FileText,
  Upload,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toaster";
import { api } from "@/lib/api-client";

interface Document {
  id: string;
  tenantId: string;
  employeeId: string;
  name: string;
  type: string;
  url: string;
  createdAt: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

const typeConfig: Record<string, { variant: "info" | "default" | "success" | "warning"; label: string }> = {
  CONTRACT: { variant: "info", label: "عقد" },
  ID: { variant: "default", label: "هوية" },
  CERTIFICATE: { variant: "success", label: "شهادة" },
  OTHER: { variant: "warning", label: "أخرى" },
};

const documentTypes = [
  { value: "CONTRACT", label: "عقد" },
  { value: "ID", label: "هوية" },
  { value: "CERTIFICATE", label: "شهادة" },
  { value: "OTHER", label: "أخرى" },
];

export function DocumentsPage() {
  const { addToast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [uploadName, setUploadName] = useState("");
  const [uploadType, setUploadType] = useState("");
  const [uploadEmployeeId, setUploadEmployeeId] = useState("");

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = employeeFilter !== "all"
        ? `/documents/employee/${employeeFilter}`
        : "/documents";
      const data = await api.get<Document[]>(endpoint);
      setDocuments(Array.isArray(data) ? data : []);
    } catch {
      addToast({ title: "خطأ", description: "فشل في تحميل المستندات", variant: "danger" });
    } finally {
      setLoading(false);
    }
  }, [employeeFilter, addToast]);

  const fetchEmployees = useCallback(async () => {
    try {
      const data = await api.get<Employee[]>("/employees");
      setEmployees(Array.isArray(data) ? data : []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleUpload = async () => {
    if (!uploadName || !uploadType || !uploadEmployeeId) return;
    setUploading(true);
    try {
      await api.post("/documents", {
        name: uploadName,
        type: uploadType,
        employeeId: uploadEmployeeId,
      });
      addToast({ title: "نجاح", description: "تم رفع المستند بنجاح", variant: "success" });
      setUploadOpen(false);
      setUploadName("");
      setUploadType("");
      setUploadEmployeeId("");
      fetchDocuments();
    } catch {
      addToast({ title: "خطأ", description: "فشل في رفع المستند", variant: "danger" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/documents/${deleteId}`);
      addToast({ title: "نجاح", description: "تم حذف المستند بنجاح", variant: "success" });
      setDeleteId(null);
      fetchDocuments();
    } catch {
      addToast({ title: "خطأ", description: "فشل في حذف المستند", variant: "danger" });
    } finally {
      setDeleting(false);
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : employeeId;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">المستندات</h1>
          <p className="mt-1 text-muted-foreground">
            إدارة مستندات الموظفين وملفاتهم.
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Plus className="h-4 w-4" />
          رفع مستند
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            جميع المستندات ({documents.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground whitespace-nowrap">فلتر حسب الموظف:</label>
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="جميع الموظفين" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الموظفين</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FolderOpen className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">لا توجد مستندات</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم المستند</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>الموظف</TableHead>
                      <TableHead>تاريخ الرفع</TableHead>
                      <TableHead className="text-start">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => {
                      const config = typeConfig[doc.type] || typeConfig.OTHER;
                      return (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.name}</TableCell>
                          <TableCell>
                            <Badge variant={config.variant}>{config.label}</Badge>
                          </TableCell>
                          <TableCell>{getEmployeeName(doc.employeeId)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(doc.createdAt).toLocaleDateString("ar-EG")}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteId(doc.id)}
                              aria-label="حذف"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden space-y-3">
                {documents.map((doc) => {
                  const config = typeConfig[doc.type] || typeConfig.OTHER;
                  return (
                    <Card key={doc.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground">{doc.name}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <Badge variant={config.variant} className="text-[10px]">
                                {config.label}
                              </Badge>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {getEmployeeName(doc.employeeId)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(doc.createdAt).toLocaleDateString("ar-EG")}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(doc.id)}
                            aria-label="حذف"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              رفع مستند جديد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              label="اسم المستند"
              placeholder="أدخل اسم المستند..."
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                نوع المستند
                <span className="text-danger me-1">*</span>
              </label>
              <Select value={uploadType} onValueChange={setUploadType}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((dt) => (
                    <SelectItem key={dt.value} value={dt.value}>
                      {dt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                الموظف
                <span className="text-danger me-1">*</span>
              </label>
              <Select value={uploadEmployeeId} onValueChange={setUploadEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الموظف" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!uploadName || !uploadType || !uploadEmployeeId || uploading}
            >
              {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
              رفع المستند
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-4">
            هل أنت متأكد من حذف هذا المستند؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
