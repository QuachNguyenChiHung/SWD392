import { apiService } from '../api';
import type {
  AdminClass,
  AdminClassStats,
  AdminQuiz,
  ClassStatsParams,
  DeleteAdminClassResponse,
  DeleteAdminQuizResponse,
} from '../../types/adminType';

export const adminSystemApi = {
  getClassById: async (classId: string): Promise<AdminClass> => {
    const response = await apiService.get(`/class/${classId}`);
    return response;
  },

  getClassStats: async (params: ClassStatsParams = {}): Promise<AdminClassStats> => {
    const searchParams = new URLSearchParams();

    if (params.timeRange) searchParams.set('timeRange', params.timeRange);
    if (params.status) searchParams.set('status', params.status);

    const queryString = searchParams.toString();
    const response = await apiService.get(`/admin/stats/classes${queryString ? `?${queryString}` : ''}`);
    return response;
  },

  deleteClass: async (classId: string): Promise<DeleteAdminClassResponse> => {
    const response = await apiService.delete(`/admin/classes/${classId}`);
    return response;
  },

  getAllQuizzes: async (page: number = 1): Promise<AdminQuiz[]> => {
    const response = await apiService.get(`/quizzes?page=${page}`);
    return Array.isArray(response) ? response : response.data || response;
  },

  deleteQuiz: async (quizId: string): Promise<DeleteAdminQuizResponse> => {
    const response = await apiService.delete(`/admin/quizzes/${quizId}`);
    return response;
  },
};