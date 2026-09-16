import { api } from "./client";

export const clientsApi = {
  list: () => api.get("/clients").then((r) => r.data),
  get: (id) => api.get(`/clients/${id}`).then((r) => r.data),
  updatePlan: (id, data) => api.patch(`/clients/${id}/plan`, data).then((r) => r.data),
  deactivate: (id) => api.post(`/clients/${id}/deactivate`).then((r) => r.data),
  me: () => api.get("/clients/me").then((r) => r.data),
};
