import { api } from "./client";

export const complaintsApi = {
  list: (params) => api.get("/complaints", { params }).then((r) => r.data),
  mine: () => api.get("/complaints/mine").then((r) => r.data),
  get: (id) => api.get(`/complaints/${id}`).then((r) => r.data),
  create: (formData) => api.post("/complaints", formData).then((r) => r.data),
  updateStatus: (id, data) => api.patch(`/complaints/${id}`, data).then((r) => r.data),
};
