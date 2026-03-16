import { apiService } from "../services/api";

export async function getModeratorSummary() {
  // apiService.get(...) already returns response.data (see services/api.ts)
  const data = await apiService.get("/dashboard");
  // Guard against unexpected shapes from backend by defaulting to an empty object
  const d = data || {};
  return {
    pendingMaterials: d.pendingCount || 0,
    flaggedMaterials: d.violationCount || 0,
    bannedUsers: d.suspendedCount || 0,
    reviewedToday: 0, // Not explicitly tracked in backend yet
    totalMaterials: d.totalMaterials || 0,
    totalTeachers: d.totalTeachers || 0,
    totalStudents: d.totalStudents || 0,
    totalTopics: d.totalTopics || 0,
    totalClasses: d.totalClasses || 0,
    violationReports: d.violationReports || [],
  };
}

export async function getModeratorRecentActions() {
  return []; // Mocked for now, needs logs feature on backend
}
