import { api } from "./client";

export const dashboardApi = {
  adminSummary: () => api.get("/dashboard/admin-summary").then((r) => r.data),
};
