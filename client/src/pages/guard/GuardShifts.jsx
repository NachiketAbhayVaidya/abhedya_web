import { useQuery } from "@tanstack/react-query";
import { shiftsApi } from "../../api/shifts";
import { Badge, Card, EmptyState, PageHeader, Spinner } from "../../components/ui";

export default function GuardShifts() {
  const { data: shifts, isLoading } = useQuery({ queryKey: ["shifts-mine"], queryFn: shiftsApi.mine });

  return (
    <div>
      <PageHeader title="Shift history" />
      {isLoading ? (
        <Spinner />
      ) : shifts.length === 0 ? (
        <EmptyState message="You haven't clocked any shifts yet." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Site</th>
                <th className="px-4 py-3">Clock in</th>
                <th className="px-4 py-3">Clock out</th>
                <th className="px-4 py-3">Hours</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s) => (
                <tr key={s._id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">{s.site?.name}</td>
                  <td className="px-4 py-3">{new Date(s.clockIn.time).toLocaleString()}</td>
                  <td className="px-4 py-3">{s.clockOut ? new Date(s.clockOut.time).toLocaleString() : "—"}</td>
                  <td className="px-4 py-3">{s.hoursWorked}</td>
                  <td className="px-4 py-3">
                    <Badge>{s.status}</Badge>
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
