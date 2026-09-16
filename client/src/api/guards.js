import { api } from "./client";

export const guardsApi = {
  list: () => api.get("/guards").then((r) => r.data),
  get: (id) => api.get(`/guards/${id}`).then((r) => r.data),
  update: (id, data) => api.patch(`/guards/${id}`, data).then((r) => r.data),
  deactivate: (id) => api.post(`/guards/${id}/deactivate`).then((r) => r.data),
  me: () => api.get("/guards/me").then((r) => r.data),
  uploadDocument: (id, formData) =>
    api.post(`/guards/${id}/documents`, formData).then((r) => r.data),
};
