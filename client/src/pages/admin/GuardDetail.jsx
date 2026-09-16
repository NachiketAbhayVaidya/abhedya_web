import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { guardsApi } from "../../api/guards";
import { sitesApi } from "../../api/sites";
import { shiftsApi } from "../../api/shifts";
import { Badge, Button, Card, PageHeader, Select, Spinner } from "../../components/ui";

export default function GuardDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: guard, isLoading } = useQuery({
    queryKey: ["guard", id],
    queryFn: () => guardsApi.get(id),
  });
  const { data: sites } = useQuery({ queryKey: ["sites"], queryFn: () => sitesApi.list() });
  const { data: shifts } = useQuery({
    queryKey: ["shifts", { guard: id }],
    queryFn: () => shiftsApi.list({ guard: id }),
  });

  const [hourlyRate, setHourlyRate] = useState(null);

  const updateMutation = useMutation({
    mutationFn: (data) => guardsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guard", id] });
      queryClient.invalidateQueries({ queryKey: ["guards"] });
      toast.success("Guard updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const deactivateMutation = useMutation({
    mutationFn: () => guardsApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guard", id] });
      queryClient.invalidateQueries({ queryKey: ["guards"] });
      toast.success("Guard deactivated");
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <Link to="/admin/guards" className="mb-4 inline-block text-sm text-indigo-600 hover:underline">
        &larr; Back to guards
      </Link>
      <PageHeader
        title={guard.user?.name}
        subtitle={guard.user?.email}
        actions={
          guard.status !== "inactive" && (
            <Button variant="danger" onClick={() => deactivateMutation.mutate()}>
              Deactivate
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="mb-3 font-semibold text-slate-800">Profile</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Status</dt>
              <dd>
                <Badge>{guard.status}</Badge>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Hourly rate</dt>
              <dd>₹{guard.hourlyRate}/hr</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Phone</dt>
              <dd>{guard.user?.phone || "—"}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold text-slate-800">Assign site</h2>
          <Select
            defaultValue={guard.assignedSite?._id || ""}
            onChange={(e) => updateMutation.mutate({ assignedSite: e.target.value })}
          >
            <option value="">Unassigned</option>
            {sites?.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold text-slate-800">Hourly rate</h2>
          <div className="flex gap-2">
            <input
              type="number"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder={guard.hourlyRate}
              value={hourlyRate ?? ""}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
            <Button
              onClick={() => updateMutation.mutate({ hourlyRate: Number(hourlyRate) })}
              disabled={!hourlyRate}
            >
              Save
            </Button>
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="mb-3 font-semibold text-slate-800">Recent shifts</h2>
        {!shifts || shifts.length === 0 ? (
          <p className="text-sm text-slate-500">No shifts recorded yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Site</th>
                <th className="py-2">Clock in</th>
                <th className="py-2">Clock out</th>
                <th className="py-2">Hours</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s) => (
                <tr key={s._id} className="border-t border-slate-100">
                  <td className="py-2">{s.site?.name}</td>
                  <td className="py-2">{new Date(s.clockIn.time).toLocaleString()}</td>
                  <td className="py-2">{s.clockOut ? new Date(s.clockOut.time).toLocaleString() : "—"}</td>
                  <td className="py-2">{s.hoursWorked}</td>
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
