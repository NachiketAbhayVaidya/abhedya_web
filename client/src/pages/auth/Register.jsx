import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";
import { Button, Card, Input, Select } from "../../components/ui";

export default function Register() {
  const [form, setForm] = useState({
    role: "guard",
    name: "",
    email: "",
    phone: "",
    password: "",
    organizationName: "",
  });
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await authApi.register(form);
      setSession(user);
      toast.success("Account created");
      navigate(`/${user.role}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Create your account</h1>
        <p className="mb-6 text-sm text-slate-500">Join Abhedya Security as a guard or client</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="I am a" value={form.role} onChange={update("role")}>
            <option value="guard">Security Guard</option>
            <option value="client">Client Organization</option>
          </Select>
          <Input label="Full name" required value={form.name} onChange={update("name")} />
          <Input label="Email" type="email" required value={form.email} onChange={update("email")} />
          <Input label="Phone" value={form.phone} onChange={update("phone")} />
          {form.role === "client" && (
            <Input
              label="Organization name"
              required
              value={form.organizationName}
              onChange={update("organizationName")}
            />
          )}
          <Input
            label="Password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={update("password")}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
