import { useQuery } from "@tanstack/react-query";
import { paymentsApi } from "../../api/payments";
import { Badge, Card, EmptyState, PageHeader, Spinner } from "../../components/ui";

export default function GuardPayments() {
  const { data: payments, isLoading } = useQuery({ queryKey: ["payments-mine"], queryFn: paymentsApi.mine });

  return (
    <div>
      <PageHeader title="Payments" subtitle="Your earnings from completed shifts" />
      {isLoading ? (
        <Spinner />
      ) : payments.length === 0 ? (
        <EmptyState message="No payments yet." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Hours</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    {new Date(p.periodStart).toLocaleDateString()} - {new Date(p.periodEnd).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{p.hoursWorked}</td>
                  <td className="px-4 py-3 font-medium">₹{p.amount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Badge>{p.status}</Badge>
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
