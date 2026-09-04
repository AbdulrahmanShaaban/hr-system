"use client";

import React, { useState } from "react";
import { Loader2, Plus, Building2, Calendar, Banknote, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";

interface SettingsSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const sections: SettingsSection[] = [
  { id: "company", label: "Company Profile", icon: <Building2 className="h-4 w-4" /> },
  { id: "leave-types", label: "Leave Types", icon: <Calendar className="h-4 w-4" /> },
  { id: "loan-types", label: "Loan Types", icon: <Banknote className="h-4 w-4" /> },
  { id: "shifts", label: "Shifts", icon: <Clock className="h-4 w-4" /> },
];

const placeholderLeaveTypes = [
  { id: "1", name: "Annual Leave", defaultDays: 21, isPaid: true },
  { id: "2", name: "Sick Leave", defaultDays: 14, isPaid: true },
  { id: "3", name: "Personal Leave", defaultDays: 5, isPaid: false },
  { id: "4", name: "Maternity Leave", defaultDays: 90, isPaid: true },
];

const placeholderLoanTypes = [
  { id: "1", name: "Personal Loan", maxAmount: 100000, interestRate: 5 },
  { id: "2", name: "Advance Salary", maxAmount: 24000, interestRate: 0 },
  { id: "3", name: "Emergency Loan", maxAmount: 50000, interestRate: 3 },
];

const placeholderShifts = [
  { id: "1", name: "Morning Shift", startTime: "08:00", endTime: "16:00", graceMinutes: 15 },
  { id: "2", name: "Evening Shift", startTime: "16:00", endTime: "00:00", graceMinutes: 15 },
  { id: "3", name: "Night Shift", startTime: "00:00", endTime: "08:00", graceMinutes: 30 },
];

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState("company");

  const [companyName, setCompanyName] = useState("Qawam Technologies");
  const [companyEmail, setCompanyEmail] = useState("hr@qawam.com");
  const [companyPhone, setCompanyPhone] = useState("+20 123 456 7890");
  const [companyAddress, setCompanyAddress] = useState("Cairo, Egypt");
  const [companyTimezone, setCompanyTimezone] = useState("Africa/Cairo");
  const [companyCurrency, setCompanyCurrency] = useState("USD");

  const [leaveTypes, setLeaveTypes] = useState(placeholderLeaveTypes);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [newLeaveName, setNewLeaveName] = useState("");
  const [newLeaveDays, setNewLeaveDays] = useState("");
  const [newLeavePaid, setNewLeavePaid] = useState(true);

  const [loanTypes, setLoanTypes] = useState(placeholderLoanTypes);
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [newLoanName, setNewLoanName] = useState("");
  const [newLoanMax, setNewLoanMax] = useState("");
  const [newLoanRate, setNewLoanRate] = useState("");

  const [shifts, setShifts] = useState(placeholderShifts);
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [newShiftName, setNewShiftName] = useState("");
  const [newShiftStart, setNewShiftStart] = useState("");
  const [newShiftEnd, setNewShiftEnd] = useState("");
  const [newShiftGrace, setNewShiftGrace] = useState("");

  const handleAddLeaveType = () => {
    setLeaveTypes([
      ...leaveTypes,
      { id: String(Date.now()), name: newLeaveName, defaultDays: parseInt(newLeaveDays) || 0, isPaid: newLeavePaid },
    ]);
    setLeaveDialogOpen(false);
    setNewLeaveName("");
    setNewLeaveDays("");
    setNewLeavePaid(true);
  };

  const handleAddLoanType = () => {
    setLoanTypes([
      ...loanTypes,
      { id: String(Date.now()), name: newLoanName, maxAmount: parseFloat(newLoanMax) || 0, interestRate: parseFloat(newLoanRate) || 0 },
    ]);
    setLoanDialogOpen(false);
    setNewLoanName("");
    setNewLoanMax("");
    setNewLoanRate("");
  };

  const handleAddShift = () => {
    setShifts([
      ...shifts,
      { id: String(Date.now()), name: newShiftName, startTime: newShiftStart, endTime: newShiftEnd, graceMinutes: parseInt(newShiftGrace) || 0 },
    ]);
    setShiftDialogOpen(false);
    setNewShiftName("");
    setNewShiftStart("");
    setNewShiftEnd("");
    setNewShiftGrace("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Configure your organization settings and preferences.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex lg:w-56 flex-row lg:flex-col gap-1 overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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

        <div className="flex-1">
          {activeSection === "company" && (
            <Card>
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>Manage your company information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                  <Input label="Email" type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
                  <Input label="Phone" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
                  <Input label="Address" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Timezone</label>
                    <Select value={companyTimezone} onValueChange={setCompanyTimezone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Cairo">Africa/Cairo (UTC+2)</SelectItem>
                        <SelectItem value="Asia/Dubai">Asia/Dubai (UTC+4)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (UTC-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Currency</label>
                    <Select value={companyCurrency} onValueChange={setCompanyCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EGP">EGP - Egyptian Pound</SelectItem>
                        <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                        <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "leave-types" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Leave Types</CardTitle>
                  <CardDescription>Manage available leave types for employees.</CardDescription>
                </div>
                <Button size="sm" onClick={() => setLeaveDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Default Days</TableHead>
                      <TableHead>Paid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveTypes.map((lt) => (
                      <TableRow key={lt.id}>
                        <TableCell className="font-medium">{lt.name}</TableCell>
                        <TableCell className="text-right">{lt.defaultDays}</TableCell>
                        <TableCell>
                          <Badge variant={lt.isPaid ? "success" : "default"}>
                            {lt.isPaid ? "Paid" : "Unpaid"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeSection === "loan-types" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Loan Types</CardTitle>
                  <CardDescription>Manage available loan types for employees.</CardDescription>
                </div>
                <Button size="sm" onClick={() => setLoanDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Max Amount</TableHead>
                      <TableHead className="text-right">Interest Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loanTypes.map((lt) => (
                      <TableRow key={lt.id}>
                        <TableCell className="font-medium">{lt.name}</TableCell>
                        <TableCell className="text-right">
                          ${lt.maxAmount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">{lt.interestRate}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeSection === "shifts" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Shifts</CardTitle>
                  <CardDescription>Manage work shifts and schedules.</CardDescription>
                </div>
                <Button size="sm" onClick={() => setShiftDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead className="text-right">Grace Period (min)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shifts.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{s.startTime}</TableCell>
                        <TableCell>{s.endTime}</TableCell>
                        <TableCell className="text-right">{s.graceMinutes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Leave Type</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input label="Leave Type Name" value={newLeaveName} onChange={(e) => setNewLeaveName(e.target.value)} />
            <Input type="number" label="Default Days" value={newLeaveDays} onChange={(e) => setNewLeaveDays(e.target.value)} />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Paid</label>
              <Select value={newLeavePaid ? "yes" : "no"} onValueChange={(v) => setNewLeavePaid(v === "yes")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddLeaveType} disabled={!newLeaveName}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={loanDialogOpen} onOpenChange={setLoanDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Loan Type</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input label="Loan Type Name" value={newLoanName} onChange={(e) => setNewLoanName(e.target.value)} />
            <Input type="number" label="Max Amount" value={newLoanMax} onChange={(e) => setNewLoanMax(e.target.value)} />
            <Input type="number" label="Interest Rate (%)" value={newLoanRate} onChange={(e) => setNewLoanRate(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoanDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddLoanType} disabled={!newLoanName}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={shiftDialogOpen} onOpenChange={setShiftDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Shift</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input label="Shift Name" value={newShiftName} onChange={(e) => setNewShiftName(e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Input type="time" label="Start Time" value={newShiftStart} onChange={(e) => setNewShiftStart(e.target.value)} />
              <Input type="time" label="End Time" value={newShiftEnd} onChange={(e) => setNewShiftEnd(e.target.value)} />
            </div>
            <Input type="number" label="Grace Period (minutes)" value={newShiftGrace} onChange={(e) => setNewShiftGrace(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShiftDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddShift} disabled={!newShiftName}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
