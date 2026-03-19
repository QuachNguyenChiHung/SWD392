import { apiService } from "./api";

// ============================================================
// Dashboard
// ============================================================

export async function getDashboardSummary() {
  const d = (await apiService.get("/dashboard")) || {};
  return {
    pendingMaterials: d.pendingCount || 0,
    flaggedMaterials: d.violationCount || 0,
    bannedUsers: d.suspendedCount || 0,
    reviewedToday: 0,
    totalMaterials: d.totalMaterials || 0,
    totalTeachers: d.totalTeachers || 0,
    totalStudents: d.totalStudents || 0,
    totalTopics: d.totalTopics || 0,
    totalClasses: d.totalClasses || 0,
    violationReports: d.violationReports || [],
  };
}

// ============================================================
// Courses (read-only for moderator)
// ============================================================

export const getAllCourses = (page: number = 1) =>
  apiService.get(`/courses?page=${page}`);

// ============================================================
// Topics (read-only for moderator)
// ============================================================

export const getTopicsByCourse = (courseId: string, page: number = 1) =>
  apiService.get(`/topics/course/${courseId}?page=${page}`);

// ============================================================
// Classes (read-only for moderator)
// ============================================================

export const searchClasses = (name: string = "", page: number = 1) =>
  apiService.get(`/classes/search?name=${encodeURIComponent(name)}&page=${page}`);

// ============================================================
// Class Materials — view + change status (suspend)
// ============================================================

/** Get materials belonging to a class */
export const getClassMaterials = (classId: string, page: number = 1) =>
  apiService.get(`/class-materials?class_id=${classId}&page=${page}`);

/** Get materials belonging to a topic */
export const getMaterialsByTopic = (topicId: string) =>
  apiService.get(`/class-materials/topic/${topicId}`);

/** Get single material by ID — returns populated content based on type */
export const getMaterialById = (id: string) =>
  apiService.get(`/class-materials/${id}`);

/** [Moderator] Change material status (e.g. "reviewed", "rejected") */
export const changeMaterialStatus = (id: string, status: string) =>
  apiService.patch(`/class-materials/${id}/status`, { status });

/** [Moderator] Re-verify a flagged material */
export const verifyMaterial = (id: string) =>
  apiService.patch(`/class-materials/${id}/verify`);

/** Get pending materials for moderation */
export const getPendingMaterials = (params?: any) =>
  apiService.get("/class-materials/moderator/pending", { params });

// ============================================================
// Users — view + suspend / unsuspend
// ============================================================

export const searchUsers = (params: any) => {
  // Explicitly build query string to ensure Axios doesn't drop it and so it appears in logs
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, String(value));
      }
    });
  }
  const queryString = query.toString();
  return apiService.get(`/users/search${queryString ? '?' + queryString : ''}`);
};

/** [Moderator] Suspend user — sets status to "banned" */
export const suspendUser = (id: string, reason?: string) => {
  const body: any = { status: "banned" };
  if (reason) body.reason = reason;
  return apiService.patch(`/users/${id}/status`, body);
};

/** [Moderator] Unsuspend user — sets status to "active" */
export const unsuspendUser = (id: string) =>
  apiService.patch(`/users/${id}/status`, { status: "active" });

