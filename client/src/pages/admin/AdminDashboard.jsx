import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../../api/dashboard";
import { PageHeader, StatCard, Spinner } from "../../components/ui";

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-summary"],
    queryFn: dashboardApi.adminSummary,
  });

  return (
    <div>
      <PageHeader title="Operations overview" subtitle="Live snapshot across guards, clients and sites" />
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total guards" value={data.totalGuards} />
          <StatCard label="Active guards" value={data.activeGuards} />
          <StatCard label="Total clients" value={data.totalClients} />
          <StatCard label="Open shifts" value={data.openShifts} hint="Guards currently clocked in" />
          <StatCard label="Pending payments" value={data.pendingPayments} />
          <StatCard label="Open complaints" value={data.openComplaints} />
        </div>
      )}
    </div>
  );
}
