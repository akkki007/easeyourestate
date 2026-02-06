import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPropertiesPage() {
  return (
    <>
      <DashboardHeader title="Properties" />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Properties</h2>
          <p className="text-muted-foreground">
            Manage and browse properties.
          </p>
        </div>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Coming soon</CardTitle>
            <CardDescription>
              Property listings and management will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This page is a placeholder for the properties feature.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
