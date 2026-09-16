import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { paymentsApi } from "../../api/payments";
import { guardsApi } from "../../api/guards";
import { Badge, Button, Card, EmptyState, Input, PageHeader, Select, Spinner } from "../../components/ui";

export default function Payments() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ guard: "", periodStart: "", periodEnd: "" });

  const { data: payments, isLoading } = useQuery({ queryKey: ["payments"], queryFn: () => paymentsApi.list() });
  const { data: guards } = useQuery({ queryKey: ["guards"], queryFn: guardsApi.list });

  const generateMutation = useMutation({
    mutationFn: (data) => paymentsApi.generate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Payment generated");
      setForm({ guard: "", periodStart: "", periodEnd: "" });
    },
    onError: (err) => toast.error(err.message),
  });

  const markPaidMutation = useMutation({
    mutationFn: (id) => paymentsApi.markPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Marked as paid");
    },
    onError: (err) => toast.error(err.message),
  });

  function handleSubmit(e) {
    e.preventDefault();
    generateMutation.mutate(form);
  }

  return (
    <div>
      <PageHeader title="Payments" subtitle="Generate and track guard pay from completed shifts" />

      <Card className="mb-6">
        <h2 className="mb-3 font-semibold text-slate-800">Generate payment</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:items-end">
          <Select
            label="Guard"
            required
            value={form.guard}
            onChange={(e) => setForm({ ...form, guard: e.target.value })}
          >
            <option value="">Select guard</option>
            {guards?.map((g) => (
              <option key={g._id} value={g._id}>
                {g.user?.name}
              </option>
            ))}
          </Select>
          <Input
            label="Period start"
            type="date"
            required
            value={form.periodStart}
            onChange={(e) => setForm({ ...form, periodStart: e.target.value })}
          />
          <Input
            label="Period end"
            type="date"
            required
            value={form.periodEnd}
            onChange={(e) => setForm({ ...form, periodEnd: e.target.value })}
          />
          <Button type="submit" disabled={generateMutation.isPending}>
            {generateMutation.isPending ? "Generating..." : "Generate"}
          </Button>
        </form>
      </Card>

      {isLoading ? (
        <Spinner />
      ) : payments.length === 0 ? (
        <EmptyState message="No payments generated yet." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Guard</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Hours</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">{p.guard?.user?.name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(p.periodStart).toLocaleDateString()} - {new Date(p.periodEnd).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{p.hoursWorked}</td>
                  <td className="px-4 py-3 font-medium">₹{p.amount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Badge>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {p.status === "pending" && (
                      <Button variant="secondary" onClick={() => markPaidMutation.mutate(p._id)}>
                        Mark paid
                      </Button>
                    )}
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
