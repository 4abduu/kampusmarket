import api from "./client";

export async function getAddresses() {
  const response = await api.get("/addresses");
  return response.data;
}

export async function createAddress(data: any) {
  const response = await api.post("/addresses", data);
  return response.data;
}

export async function updateAddress(id: string, data: any) {
  const response = await api.put(`/addresses/${id}`, data);
  return response.data;
}

export async function deleteAddress(id: string) {
  const response = await api.delete(`/addresses/${id}`);
  return response.data;
}

export async function setPrimaryAddress(id: string) {
  const response = await api.put(`/addresses/${id}/primary`);
  return response.data;
}
