import { apiService } from '../api';
import type { AdminClassMaterial, AdminQuestion } from '../../types/adminType';

/**
 * Admin Materials & Questions API
 * Endpoints: /api/class-materials/all, /api/questions
 */
export const adminMaterialsApi = {
  /**
   * GET /api/class-materials/all - Get all class materials
   */
  getAllClassMaterials: async (page: number = 1): Promise<AdminClassMaterial[]> => {
    try {
      const response = await apiService.get(`/class-materials/all?page=${page}`);
      return response;
    } catch (error) {
      console.error('Error fetching all class materials:', error);
      throw error;
    }
  },

  /**
   * GET /api/questions - Get all questions
   */
  getAllQuestions: async (page: number = 1): Promise<AdminQuestion[]> => {
    try {
      const response = await apiService.get(`/questions?page=${page}`);
      return response;
    } catch (error) {
      console.error('Error fetching all questions:', error);
      throw error;
    }
  }
};
