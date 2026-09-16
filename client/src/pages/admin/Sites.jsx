import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { sitesApi } from "../../api/sites";
import { clientsApi } from "../../api/clients";
import { Button, Card, EmptyState, Input, PageHeader, Select, Spinner } from "../../components/ui";

const emptyForm = {
  client: "",
  name: "",
  address: "",
  lat: "",
  lng: "",
  geofenceRadiusMeters: 200,
};

export default function Sites() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [locating, setLocating] = useState(false);

  const { data: sites, isLoading } = useQuery({ queryKey: ["sites"], queryFn: () => sitesApi.list() });
  const { data: clients } = useQuery({ queryKey: ["clients"], queryFn: clientsApi.list });

  const createMutation = useMutation({
    mutationFn: (data) => sitesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      toast.success("Site created");
      setForm(emptyForm);
      setShowForm(false);
    },
    onError: (err) => toast.error(err.message),
  });

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
        toast.success("Location filled in");
      },
      (err) => {
        setLocating(false);
        toast.error(err.message || "Unable to get your location");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    createMutation.mutate({
      client: form.client,
      name: form.name,
      address: form.address,
      geofenceRadiusMeters: Number(form.geofenceRadiusMeters),
      location: { lat: Number(form.lat), lng: Number(form.lng) },
    });
  }

  return (
    <div>
      <PageHeader
        title="Sites"
        subtitle="Client locations where guards are posted"
        actions={<Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "Add site"}</Button>}
      />

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Client"
              required
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
            >
              <option value="">Select a client</option>
              {clients?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.organizationName}
                </option>
              ))}
            </Select>
            <Input
              label="Site name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Address"
              required
              className="sm:col-span-2"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <div className="sm:col-span-2">
              <Button type="button" variant="secondary" onClick={handleUseCurrentLocation} disabled={locating}>
                {locating ? "Getting location..." : "Use my current location"}
              </Button>
            </div>
            <Input
              label="Latitude"
              type="number"
              step="any"
              required
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: e.target.value })}
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              required
              value={form.lng}
              onChange={(e) => setForm({ ...form, lng: e.target.value })}
            />
            <Input
              label="Geofence radius (meters)"
              type="number"
              value={form.geofenceRadiusMeters}
              onChange={(e) => setForm({ ...form, geofenceRadiusMeters: e.target.value })}
            />
            <div className="sm:col-span-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create site"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <Spinner />
      ) : sites.length === 0 ? (
        <EmptyState message="No sites created yet." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((s) => (
            <Card key={s._id}>
              <h3 className="font-semibold text-slate-800">{s.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{s.address}</p>
              <p className="mt-1 text-xs text-slate-400">{s.client?.organizationName}</p>
              <p className="mt-2 text-xs text-slate-400">
                Geofence: {s.geofenceRadiusMeters}m &middot; {s.location.lat.toFixed(4)}, {s.location.lng.toFixed(4)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
