import { api } from "./client";

export const sitesApi = {
  list: (clientId) => api.get("/sites", { params: clientId ? { client: clientId } : {} }).then((r) => r.data),
  get: (id) => api.get(`/sites/${id}`).then((r) => r.data),
  create: (data) => api.post("/sites", data).then((r) => r.data),
  update: (id, data) => api.patch(`/sites/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/sites/${id}`).then((r) => r.data),
};
