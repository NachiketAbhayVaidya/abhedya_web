import { useQuery } from "@tanstack/react-query";
import { clientsApi } from "../../api/clients";
import { shiftsApi } from "../../api/shifts";
import { Badge, Card, EmptyState, PageHeader, Spinner } from "../../components/ui";

export default function ClientDashboard() {
  const { data: profile, isLoading } = useQuery({ queryKey: ["client-me"], queryFn: clientsApi.me });
  const { data: shifts, isLoading: shiftsLoading } = useQuery({
    queryKey: ["client-shifts"],
    queryFn: shiftsApi.forClientSites,
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <PageHeader title={profile.organizationName} subtitle="Your sites and guard activity" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold text-slate-800">Sites</h2>
          {profile.sites?.length ? (
            <ul className="space-y-2 text-sm">
              {profile.sites.map((s) => (
                <li key={s._id} className="rounded-lg border border-slate-200 p-3">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-slate-500">{s.address}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No sites set up yet. Contact HQ to add one.</p>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold text-slate-800">Assigned guards</h2>
          {profile.guards?.length ? (
            <ul className="space-y-2 text-sm">
              {profile.guards.map((g) => (
                <li key={g._id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <span className="font-medium">{g.user?.name}</span>
                  <Badge>{g.status}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No guards assigned to your sites yet.</p>
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="mb-3 font-semibold text-slate-800">Recent shift activity</h2>
        {shiftsLoading ? (
          <Spinner />
        ) : shifts.length === 0 ? (
          <EmptyState message="No shift activity recorded at your sites yet." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Guard</th>
                <th className="py-2">Site</th>
                <th className="py-2">Clock in</th>
                <th className="py-2">Clock out</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s) => (
                <tr key={s._id} className="border-t border-slate-100">
                  <td className="py-2">{s.guard?.user?.name}</td>
                  <td className="py-2">{s.site?.name}</td>
                  <td className="py-2">{new Date(s.clockIn.time).toLocaleString()}</td>
                  <td className="py-2">{s.clockOut ? new Date(s.clockOut.time).toLocaleString() : "—"}</td>
                  <td className="py-2">
                    <Badge>{s.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
