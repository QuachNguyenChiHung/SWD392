import { apiService } from '../api';
import type {
  AdminClassMaterial,
  AdminClassMaterialCountResponse,
  AdminClassMaterialDetailResponse,
  AdminQuestion,
} from '../../types/adminType';

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
      if (Array.isArray(response)) {
        return response;
      }
      if (Array.isArray(response?.data)) {
        return response.data;
      }
      return [];
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
      if (Array.isArray(response)) {
        return response;
      }
      if (Array.isArray(response?.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching all questions:', error);
      throw error;
    }
  },

  getMaterialById: async (materialId: string): Promise<AdminClassMaterialDetailResponse> => {
    try {
      const response = await apiService.get(`/class-materials/${materialId}`);
      if (response?.data?._id) {
        return response;
      }

      if (response?._id) {
        return {
          success: true,
          data: response,
        };
      }

      throw new Error('Invalid material detail response format');
    } catch (error) {
      console.error(`Error fetching class material ${materialId}:`, error);
      throw error;
    }
  },

  getMaterialCount: async (classId: string): Promise<AdminClassMaterialCountResponse> => {
    try {
      const response = await apiService.get(`/class-materials/count?class_id=${classId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching material count for class ${classId}:`, error);
      throw error;
    }
  }
};
