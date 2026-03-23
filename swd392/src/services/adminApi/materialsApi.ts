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
  },

  /**
   * GET /api/class-materials/topic/{topicId} - Get materials by topic
   */
  getClassMaterialsByTopicId: async (topicId: string, page: number = 1): Promise<AdminClassMaterial[]> => {
    try {
      const response = await apiService.get(`/class-materials/topic/${encodeURIComponent(topicId)}?page=${page}`);
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.data?.materials)) return response.data.materials;
      if (Array.isArray(response?.materials)) return response.materials;
      return [];
    } catch (error) {
      console.error(`Error fetching materials for topic ${topicId}:`, error);
      throw error;
    }
  },

  getFileById: async (fileId: string): Promise<{ _id: string; file_name: string; file_path: string }> => {
    try {
      const response = await apiService.get(`/files/${encodeURIComponent(fileId)}`);
      return (response?.data ?? response) as { _id: string; file_name: string; file_path: string };
    } catch (error) {
      console.error(`Error fetching file ${fileId}:`, error);
      throw error;
    }
  },

  getSlideById: async (slideId: string): Promise<{ _id: string; slide_name: string; file_path: string }> => {
    try {
      const response = await apiService.get(`/slides/${encodeURIComponent(slideId)}`);
      return (response?.data ?? response) as { _id: string; slide_name: string; file_path: string };
    } catch (error) {
      console.error(`Error fetching slide ${slideId}:`, error);
      throw error;
    }
  },

  getQuizById: async (quizId: string): Promise<{
    _id: string;
    title: string;
    type: string;
    available_date?: string;
    max_attempt_number?: number;
    end_date?: string;
    status?: boolean;
  }> => {
    try {
      const response = await apiService.get(`/quizzes/${encodeURIComponent(quizId)}`);
      return (response?.data ?? response) as {
        _id: string;
        title: string;
        type: string;
        available_date?: string;
        max_attempt_number?: number;
        end_date?: string;
        status?: boolean;
      };
    } catch (error) {
      console.error(`Error fetching quiz ${quizId}:`, error);
      throw error;
    }
  },

  getQuestionsByQuizId: async (quizId: string): Promise<AdminQuestion[]> => {
    const normalizeQuestions = (response: any): AdminQuestion[] => {
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.questions)) return response.questions;
      if (Array.isArray(response?.data?.questions)) return response.data.questions;

      const single = response?.data ?? response;
      if (single?._id && single?.quiz_id) return [single as AdminQuestion];
      return [];
    };

    try {
      // Try the newer/correct endpoint first
      const response = await apiService.get(`/quizzes/${encodeURIComponent(quizId)}/questions`);
      return normalizeQuestions(response);
    } catch (errorByQuizQuestions) {
      try {
        // Fallback to older endpoint (may produce 404 but we catch it)
        const response = await apiService.get(`/questions/${encodeURIComponent(quizId)}`);
        return normalizeQuestions(response);
      } catch (errorByQuestions) {
        // Only log if BOTH fail
        console.warn(`Could not fetch questions via any endpoint for quiz ${quizId}`);
        throw errorByQuestions;
      }
    }
  },
};
