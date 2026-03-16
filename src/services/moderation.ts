// Lấy danh sách người dùng (giả lập, cần thay bằng API thật nếu có)
export async function getUsers() {
  // TODO: Replace with real API endpoint when available
  // return apiService.get("/moderator/users");
  // Temporary mock for UI
  return [
    {
      id: "1",
      username: "user1",
      email: "user1@example.com",
      suspended: false,
    },
    {
      id: "2",
      username: "user2",
      email: "user2@example.com",
      suspended: true,
      suspendReason: "Vi phạm chính sách",
    },
  ];
}

// Đình chỉ người dùng
export async function suspendUser(id: string, reason: string) {
  // Replace with real API endpoint when available
  // return apiService.patch(`/users/${id}/status`, { status: "banned", reason });
  // Temporary mock for UI
  return {
    id,
    username: `user${id}`,
    email: `user${id}@example.com`,
    suspended: true,
    suspendReason: reason,
  };
}

// Gỡ đình chỉ người dùng
export async function unsuspendUser(id: string) {
  // Replace with real API endpoint when available
  // return apiService.patch(`/users/${id}/status`, { status: "active" });
  // Temporary mock for UI
  return {
    id,
    username: `user${id}`,
    email: `user${id}@example.com`,
    suspended: false,
  };
}
import { apiService } from "./api";

// Lấy danh sách tài liệu chờ duyệt
export async function getPendingMaterials() {
  return apiService.get("/moderator/materials/pending");
}

// Lấy chi tiết tài liệu
export async function getMaterialDetail(id: string) {
  return apiService.get(`/moderator/materials/${id}`);
}

// Duyệt hoặc từ chối tài liệu
export async function reviewMaterial(id: string, status: string) {
  return apiService.post(`/moderator/materials/${id}/review`, { status });
}

// Lấy danh sách tài liệu bị flag
export async function getFlaggedMaterials() {
  return apiService.get("/moderator/materials/flagged");
}

// Xác nhận lại tài liệu bị flag
export async function verifyFlaggedMaterial(id: string) {
  return apiService.post(`/moderator/materials/${id}/verify`);
}
