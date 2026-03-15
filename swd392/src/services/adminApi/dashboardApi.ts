import { apiService } from '../api';
import type { DashboardStats } from '../../types/adminType';

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
      return {
        totalUsers: response.totalUsers ?? 0,
        totalCourses: response.totalCourses ?? 0,
        totalClasses: response.totalClasses ?? 0,
        totalEnrollments: response.totalEnrollments ?? 0,
        activeStudents: response.activeStudents ?? 0,
        activeTeachers: response.activeTeachers ?? 0,
        recentActivity: response.recentActivity ?? [],
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
};
