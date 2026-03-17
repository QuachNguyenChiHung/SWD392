import { apiService } from '../api';
import type { DashboardStats } from '../../types/adminType';

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const pickNumber = (...values: unknown[]): number => {
  for (const value of values) {
    const num = toNumber(value);
    if (num !== undefined) return num;
  }
  return 0;
};

/**
 * Admin Dashboard API
 * Endpoints: /api/dashboard
 */
export const adminDashboardApi = {
  /**
   * GET /api/dashboard - Get dashboard statistics
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await apiService.get('/dashboard');
      const payload = (response as any)?.data ?? response;
      const roleStats =
        (payload as any)?.roleStats ??
        (payload as any)?.userRoleStats ??
        (payload as any)?.usersByRole ??
        (payload as any)?.userCountsByRole ??
        {};

      return {
        totalUsers: pickNumber((payload as any)?.totalUsers, (payload as any)?.total_users, (payload as any)?.userCount),
        totalCourses: pickNumber((payload as any)?.totalCourses, (payload as any)?.total_courses, (payload as any)?.courseCount),
        totalClasses: pickNumber((payload as any)?.totalClasses, (payload as any)?.total_classes, (payload as any)?.classCount),
        totalEnrollments: pickNumber((payload as any)?.totalEnrollments, (payload as any)?.total_enrollments, (payload as any)?.enrollmentCount),
        activeStudents: pickNumber(
          (payload as any)?.activeStudents,
          (payload as any)?.active_students,
          (payload as any)?.totalStudents,
          (payload as any)?.studentCount,
          (payload as any)?.students,
          (roleStats as any)?.student,
          (roleStats as any)?.students
        ),
        activeTeachers: pickNumber(
          (payload as any)?.activeTeachers,
          (payload as any)?.active_teachers,
          (payload as any)?.totalTeachers,
          (payload as any)?.teacherCount,
          (payload as any)?.teachers,
          (roleStats as any)?.teacher,
          (roleStats as any)?.teachers
        ),
        recentActivity: Array.isArray((payload as any)?.recentActivity) ? (payload as any).recentActivity : [],
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
};
