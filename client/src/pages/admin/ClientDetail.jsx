import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { clientsApi } from "../../api/clients";
import { Badge, Button, Card, PageHeader, Select, Spinner } from "../../components/ui";

export default function ClientDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: client, isLoading } = useQuery({
    queryKey: ["client", id],
    queryFn: () => clientsApi.get(id),
  });

  const planMutation = useMutation({
    mutationFn: (data) => clientsApi.updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", id] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Plan updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const deactivateMutation = useMutation({
    mutationFn: () => clientsApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", id] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client deactivated");
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <Link to="/admin/clients" className="mb-4 inline-block text-sm text-indigo-600 hover:underline">
        &larr; Back to clients
      </Link>
      <PageHeader
        title={client.organizationName}
        subtitle={client.user?.email}
        actions={
          client.subscriptionStatus !== "cancelled" && (
            <Button variant="danger" onClick={() => deactivateMutation.mutate()}>
              Deactivate
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold text-slate-800">Subscription</h2>
          <div className="mb-3 flex items-center gap-2 text-sm">
            <span className="text-slate-500">Status:</span>
            <Badge>{client.subscriptionStatus}</Badge>
          </div>
          <Select
            label="Plan"
            defaultValue={client.subscriptionPlan}
            onChange={(e) => planMutation.mutate({ subscriptionPlan: e.target.value })}
          >
            <option value="basic">Basic (up to 5 guards)</option>
            <option value="standard">Standard (up to 15 guards)</option>
            <option value="premium">Premium (up to 50 guards)</option>
          </Select>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold text-slate-800">Sites</h2>
          {client.sites?.length ? (
            <ul className="space-y-2 text-sm">
              {client.sites.map((s) => (
                <li key={s._id} className="rounded-lg border border-slate-200 p-2">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-slate-500">{s.address}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No sites yet. Add one from the Sites page.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
