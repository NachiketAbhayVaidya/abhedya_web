import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { shiftsApi } from "../../api/shifts";
import { guardsApi } from "../../api/guards";
import { Badge, Button, Card, PageHeader, Spinner } from "../../components/ui";

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(err.message || "Unable to get your location")),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

export default function GuardDashboard() {
  const queryClient = useQueryClient();
  const [locating, setLocating] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["guard-me"],
    queryFn: guardsApi.me,
  });
  const { data: currentShift, isLoading: shiftLoading } = useQuery({
    queryKey: ["shift-current"],
    queryFn: shiftsApi.current,
  });

  const clockInMutation = useMutation({
    mutationFn: shiftsApi.clockIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shift-current"] });
      toast.success("Clocked in");
    },
    onError: (err) => toast.error(err.message),
  });

  const clockOutMutation = useMutation({
    mutationFn: shiftsApi.clockOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shift-current"] });
      queryClient.invalidateQueries({ queryKey: ["shifts-mine"] });
      toast.success("Clocked out");
    },
    onError: (err) => toast.error(err.message),
  });

  async function handleClockIn() {
    setLocating(true);
    try {
      const coords = await getPosition();
      clockInMutation.mutate(coords);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLocating(false);
    }
  }

  async function handleClockOut() {
    setLocating(true);
    try {
      const coords = await getPosition();
      clockOutMutation.mutate(coords);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLocating(false);
    }
  }

  if (profileLoading || shiftLoading) return <Spinner />;

  const busy = locating || clockInMutation.isPending || clockOutMutation.isPending;

  return (
    <div>
      <PageHeader title="My shift" subtitle="Clock in and out from your assigned site" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold text-slate-800">Assignment</h2>
          {profile.assignedSite ? (
            <div className="text-sm">
              <p className="font-medium text-slate-800">{profile.assignedSite.name}</p>
              <p className="text-slate-500">{profile.assignedSite.address}</p>
              <p className="mt-2 text-xs text-slate-400">
                Allowed radius: {profile.assignedSite.geofenceRadiusMeters}m from site
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">You have not been assigned to a site yet.</p>
          )}
          <p className="mt-4 text-sm text-slate-500">
            Hourly rate: <span className="font-medium text-slate-800">₹{profile.hourlyRate}/hr</span>
          </p>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold text-slate-800">Status</h2>
          {currentShift ? (
            <>
              <div className="mb-3 flex items-center gap-2">
                <Badge>open</Badge>
                <span className="text-sm text-slate-500">
                  since {new Date(currentShift.clockIn.time).toLocaleTimeString()}
                </span>
              </div>
              <Button variant="danger" onClick={handleClockOut} disabled={busy}>
                {busy ? "Getting location..." : "Clock out"}
              </Button>
            </>
          ) : (
            <>
              <p className="mb-3 text-sm text-slate-500">You are not currently clocked in.</p>
              <Button onClick={handleClockIn} disabled={busy || !profile.assignedSite}>
                {busy ? "Getting location..." : "Clock in"}
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
