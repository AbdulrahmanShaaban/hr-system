import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Leave() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Leave Management</h1>
        <p className="mt-1 text-muted-foreground">Manage employee leave requests and balances.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This feature is under development.</p>
        </CardContent>
      </Card>
    </div>
  );
}
