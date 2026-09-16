import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { complaintsApi } from "../../api/complaints";
import { clientsApi } from "../../api/clients";
import { Badge, Button, Card, EmptyState, Input, PageHeader, Select, Spinner } from "../../components/ui";

export default function ClientComplaints() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", site: "", guard: "", priority: "medium" });
  const [files, setFiles] = useState([]);

  const { data: complaints, isLoading } = useQuery({
    queryKey: ["complaints-mine"],
    queryFn: complaintsApi.mine,
  });
  const { data: profile } = useQuery({ queryKey: ["client-me"], queryFn: clientsApi.me });

  const createMutation = useMutation({
    mutationFn: (formData) => complaintsApi.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints-mine"] });
      toast.success("Complaint filed");
      setForm({ subject: "", description: "", site: "", guard: "", priority: "medium" });
      setFiles([]);
      setShowForm(false);
    },
    onError: (err) => toast.error(err.message),
  });

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    files.forEach((f) => formData.append("attachments", f));
    createMutation.mutate(formData);
  }

  return (
    <div>
      <PageHeader
        title="Complaints"
        subtitle="Report issues about guards or sites to Abhedya HQ"
        actions={<Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "File complaint"}</Button>}
      />

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Subject"
              required
              className="sm:col-span-2"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">Description</span>
              <textarea
                required
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <Select
              label="Related site (optional)"
              value={form.site}
              onChange={(e) => setForm({ ...form, site: e.target.value })}
            >
              <option value="">None</option>
              {profile?.sites?.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </Select>
            <Select
              label="Related guard (optional)"
              value={form.guard}
              onChange={(e) => setForm({ ...form, guard: e.target.value })}
            >
              <option value="">None</option>
              {profile?.guards?.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.user?.name}
                </option>
              ))}
            </Select>
            <Select
              label="Priority"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Attachments (optional)</span>
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 3))}
                className="w-full text-sm"
              />
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Submitting..." : "Submit complaint"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <Spinner />
      ) : complaints.length === 0 ? (
        <EmptyState message="You haven't filed any complaints." />
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <Card key={c._id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-800">{c.subject}</h3>
                  <p className="text-xs text-slate-400">
                    {c.site ? c.site.name : "General"} {c.guard ? `· re: ${c.guard.user?.name}` : ""}
                  </p>
                </div>
                <Badge>{c.status}</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-600">{c.description}</p>
              {c.resolutionNotes && (
                <p className="mt-2 rounded-lg bg-emerald-50 p-2 text-sm text-emerald-800">
                  <strong>Resolution:</strong> {c.resolutionNotes}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
