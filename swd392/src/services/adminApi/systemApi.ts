import { apiService } from '../api';
import type {
  AdminClass,
  AdminClassStats,
  AdminQuiz,
  ClassStatsParams,
  DeleteAdminClassResponse,
  DeleteAdminQuizResponse,
} from '../../types/adminType';

interface ClassSearchResult {
  classes: AdminClass[];
  page: number;
  hasNextPage: boolean;
}

export const adminSystemApi = {
  getAllClasses: async (params: ClassStatsParams = {}): Promise<AdminClass[]> => {
    const searchParams = new URLSearchParams();

    if (params.timeRange) searchParams.set('timeRange', params.timeRange);
    if (params.status) searchParams.set('status', params.status);

    const queryString = searchParams.toString();
    const response = await apiService.get(`/admin/stats/classes${queryString ? `?${queryString}` : ''}`);

    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.classes)) return response.classes;

    return [];
  },

  getClassById: async (classId: string): Promise<AdminClass> => {
    const response = await apiService.get(`/class/${classId}`);
    return response;
  },

  searchClasses: async (name: string = '', page: number = 1): Promise<ClassSearchResult> => {
    const searchParams = new URLSearchParams();
    const keyword = name.trim();

    if (keyword) searchParams.set('name', keyword);
    searchParams.set('page', String(page));

    const response = await apiService.get(`/classes/search?${searchParams.toString()}`);

    if (Array.isArray(response)) {
      return {
        classes: response,
        page,
        hasNextPage: response.length >= 10,
      };
    }

    const normalizedClasses = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.classes)
        ? response.classes
        : [];

    const normalizedPage = Number(response?.page ?? page) || page;
    const totalPages = Number(response?.totalPages ?? response?.total_pages);
    const hasNextPage = typeof response?.hasNext === 'boolean'
      ? response.hasNext
      : Number.isFinite(totalPages)
        ? normalizedPage < totalPages
        : normalizedClasses.length >= 10;

    return {
      classes: normalizedClasses,
      page: normalizedPage,
      hasNextPage,
    };
  },

  getClassStats: async (params: ClassStatsParams = {}): Promise<AdminClassStats> => {
    const searchParams = new URLSearchParams();

    if (params.timeRange) searchParams.set('timeRange', params.timeRange);
    if (params.status) searchParams.set('status', params.status);

    const queryString = searchParams.toString();
    const response = await apiService.get(`/admin/stats/classes${queryString ? `?${queryString}` : ''}`);

    if (Array.isArray(response)) {
      const active = response.filter((item) => item?.status === 'active').length;
      const inactive = response.filter((item) => item?.status !== 'active').length;

      return {
        timeRange: params.timeRange ?? 'all',
        status: params.status ?? 'all',
        totalClasses: response.length,
        byStatus: {
          active,
          inactive,
        },
        averageClassSize: 0,
        topEnrolledClasses: [],
        trend: [],
      };
    }

    if (response?.data && !Array.isArray(response.data)) {
      return response.data;
    }

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