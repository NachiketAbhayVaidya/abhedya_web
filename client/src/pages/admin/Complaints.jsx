import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { complaintsApi } from "../../api/complaints";
import { Badge, Card, EmptyState, PageHeader, Select, Spinner } from "../../components/ui";

export default function Complaints() {
  const queryClient = useQueryClient();
  const { data: complaints, isLoading } = useQuery({
    queryKey: ["complaints"],
    queryFn: () => complaintsApi.list(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => complaintsApi.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Status updated");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div>
      <PageHeader title="Complaints" subtitle="Issues raised by client organizations" />
      {isLoading ? (
        <Spinner />
      ) : complaints.length === 0 ? (
        <EmptyState message="No complaints filed yet." />
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <Card key={c._id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-800">{c.subject}</h3>
                  <p className="text-xs text-slate-400">
                    {c.client?.organizationName} {c.site ? `· ${c.site.name}` : ""}{" "}
                    {c.guard ? `· re: ${c.guard.user?.name}` : ""}
                  </p>
                </div>
                <Badge>{c.priority}</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-600">{c.description}</p>
              {c.attachments?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {c.attachments.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      View attachment
                    </a>
                  ))}
                </div>
              )}
              <div className="mt-4 flex items-center gap-3">
                <Select
                  value={c.status}
                  onChange={(e) => statusMutation.mutate({ id: c._id, status: e.target.value })}
                  className="!w-auto"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In progress</option>
                  <option value="resolved">Resolved</option>
                </Select>
                <span className="text-xs text-slate-400">
                  Filed {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
