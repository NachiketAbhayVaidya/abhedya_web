import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { clientsApi } from "../../api/clients";
import { Badge, Card, EmptyState, PageHeader, Spinner } from "../../components/ui";

export default function Clients() {
  const { data: clients, isLoading } = useQuery({ queryKey: ["clients"], queryFn: clientsApi.list });

  return (
    <div>
      <PageHeader title="Clients" subtitle="Organizations hiring guards through Abhedya" />
      {isLoading ? (
        <Spinner />
      ) : clients.length === 0 ? (
        <EmptyState message="No client organizations yet." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Max guards</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link to={`/admin/clients/${c._id}`} className="font-medium text-indigo-600 hover:underline">
                      {c.organizationName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.user?.email}</td>
                  <td className="px-4 py-3 capitalize">{c.subscriptionPlan}</td>
                  <td className="px-4 py-3">{c.maxGuards}</td>
                  <td className="px-4 py-3">
                    <Badge>{c.subscriptionStatus}</Badge>
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
