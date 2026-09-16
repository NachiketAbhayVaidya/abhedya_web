import { api } from "./client";

export const paymentsApi = {
  list: (params) => api.get("/payments", { params }).then((r) => r.data),
  mine: () => api.get("/payments/mine").then((r) => r.data),
  generate: (data) => api.post("/payments", data).then((r) => r.data),
  markPaid: (id, notes) => api.post(`/payments/${id}/mark-paid`, { notes }).then((r) => r.data),
};
