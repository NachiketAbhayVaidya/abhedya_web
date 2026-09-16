import { useQuery } from "@tanstack/react-query";
import { clientsApi } from "../../api/clients";
import { Badge, Card, PageHeader, Spinner } from "../../components/ui";

const PLANS = [
  { id: "basic", label: "Basic", maxGuards: 5, price: "₹9,999/mo" },
  { id: "standard", label: "Standard", maxGuards: 15, price: "₹24,999/mo" },
  { id: "premium", label: "Premium", maxGuards: 50, price: "₹69,999/mo" },
];

export default function ClientSubscription() {
  const { data: profile, isLoading } = useQuery({ queryKey: ["client-me"], queryFn: clientsApi.me });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Subscription" subtitle="Your current plan and limits" />

      <Card className="mb-6 max-w-md">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold capitalize text-slate-800">{profile.subscriptionPlan} plan</h2>
          <Badge>{profile.subscriptionStatus}</Badge>
        </div>
        <p className="text-sm text-slate-500">Up to {profile.maxGuards} guards</p>
        <p className="mt-3 text-xs text-slate-400">
          To change your plan, contact Abhedya HQ support.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={plan.id === profile.subscriptionPlan ? "ring-2 ring-indigo-500" : ""}
          >
            <h3 className="font-semibold text-slate-800">{plan.label}</h3>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{plan.price}</p>
            <p className="mt-2 text-sm text-slate-500">Up to {plan.maxGuards} guards</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
