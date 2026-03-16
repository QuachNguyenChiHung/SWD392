import { apiService } from "../services/api";

export async function filterMaterials(params: any) {
  // params: { page, limit, type, status, keyword, fromDate, toDate, ... }
  // Backend Swagger route for moderator pending materials:
  return apiService.get("/class-materials/moderator/pending", { params });
}

export async function filterUsers(params: any) {
  // params: { role, status, keyword, ... }
  // Backend Swagger route for users search
  return apiService.get("/users/search", { params });
}

export async function getAuditLogs(params: any) {
  // params: { limit, fromDate, toDate, action, ... }
  // Currently mock or using admin endpoint if available
  return apiService.get("/admin/logs", { params });
}

export async function changeMaterialStatus(id: string, status: string) {
  return apiService.patch(`/class-materials/${id}/status`, { status });
}

export async function verifyMaterial(id: string) {
  return apiService.patch(`/class-materials/${id}/verify`);
}

