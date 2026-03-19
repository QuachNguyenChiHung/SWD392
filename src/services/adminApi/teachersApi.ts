import { apiService } from '../api';
import type { AdminUser } from '../../types/adminType';

export interface AdminTeacherDetail {
  credential: string | null;
  user: AdminUser | null;
}

export const adminTeachersApi = {
  /**
   * GET /api/teachers/{id} - Get teacher by teacher document ID
   */
  getTeacherById: async (teacherId: string): Promise<AdminTeacherDetail> => {
    try {
      const response = await apiService.get(`/teachers/${encodeURIComponent(teacherId)}`);

      return {
        credential: response?.credential ?? null,
        user: response?.user ?? null,
      };
    } catch (error) {
      console.error(`Error fetching teacher ${teacherId}:`, error);
      throw error;
    }
  },
};
