import { api } from "./client";

export const shiftsApi = {
  clockIn: (data) => api.post("/shifts/clock-in", data).then((r) => r.data),
  clockOut: (data) => api.post("/shifts/clock-out", data).then((r) => r.data),
  current: () => api.get("/shifts/mine/current").then((r) => r.data),
  mine: () => api.get("/shifts/mine").then((r) => r.data),
  forClientSites: () => api.get("/shifts/client-sites").then((r) => r.data),
  list: (params) => api.get("/shifts", { params }).then((r) => r.data),
};
