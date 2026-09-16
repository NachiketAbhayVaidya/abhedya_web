import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { guardsApi } from "../../api/guards";
import { Badge, Card, EmptyState, PageHeader, Spinner } from "../../components/ui";

export default function Guards() {
  const { data: guards, isLoading } = useQuery({ queryKey: ["guards"], queryFn: guardsApi.list });

  return (
    <div>
      <PageHeader title="Guards" subtitle="All registered security guards" />
      {isLoading ? (
        <Spinner />
      ) : guards.length === 0 ? (
        <EmptyState message="No guards have registered yet." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Hourly rate</th>
                <th className="px-4 py-3">Assigned site</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {guards.map((g) => (
                <tr key={g._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link to={`/admin/guards/${g._id}`} className="font-medium text-indigo-600 hover:underline">
                      {g.user?.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{g.user?.email}</td>
                  <td className="px-4 py-3">₹{g.hourlyRate}/hr</td>
                  <td className="px-4 py-3 text-slate-600">{g.assignedSite?.name || "Unassigned"}</td>
                  <td className="px-4 py-3">
                    <Badge>{g.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
