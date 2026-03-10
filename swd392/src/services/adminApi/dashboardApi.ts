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
      return response;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
};
