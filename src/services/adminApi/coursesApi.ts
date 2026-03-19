import { apiService } from '../api';
import type {
  AdminCourse,
  CreateCourseRequest,
  UpdateCourseRequest,
  PaginationParams
} from '../../types/adminType';

/**
 * Admin Courses API
 * Endpoints: /api/courses
 */
export const adminCoursesApi = {
  /**
   * GET /api/courses - Get all courses (paginated)
   */
  getAllCourses: async (params: PaginationParams = {}): Promise<AdminCourse[]> => {
    try {
      const { page = 1 } = params;
      const response = await apiService.get(`/courses?page=${page}`);
      return response;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  /**
   * GET /api/courses/search - Search courses by keyword
   */
  searchCourses: async (keyword: string, page: number = 1): Promise<AdminCourse[]> => {
    try {
      const response = await apiService.get(
        `/courses/search?keyword=${encodeURIComponent(keyword)}&page=${page}`
      );
      return response;
    } catch (error) {
      console.error('Error searching courses:', error);
      throw error;
    }
  },

  /**
   * GET /api/courses/{id} - Get course by ID
   */
  getCourseById: async (courseId: string): Promise<AdminCourse> => {
    try {
      const response = await apiService.get(`/courses/${courseId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error);
      throw error;
    }
  },

  /**
   * POST /api/courses - Create new course
   */
  createCourse: async (courseData: CreateCourseRequest): Promise<AdminCourse> => {
    try {
      const response = await apiService.post('/courses', courseData);
      return response;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  /**
   * PUT /api/courses/{id} - Update course
   */
  updateCourse: async (courseId: string, courseData: UpdateCourseRequest): Promise<AdminCourse> => {
    try {
      const response = await apiService.put(`/courses/${courseId}`, courseData);
      return response;
    } catch (error) {
      console.error(`Error updating course ${courseId}:`, error);
      throw error;
    }
  },

  /**
   * DELETE /api/courses/{id} - Delete course permanently
   */
  deleteCourse: async (courseId: string): Promise<void> => {
    try {
      await apiService.delete(`/courses/${courseId}`);
    } catch (error) {
      console.error(`Error deleting course ${courseId}:`, error);
      throw error;
    }
  },

  /**
   * PATCH /api/courses/{id}/toggle-status - Toggle course active/inactive
   */
  toggleCourseStatus: async (courseId: string): Promise<AdminCourse> => {
    try {
      const response = await apiService.patch(`/courses/${courseId}/toggle-status`, {});
      return response;
    } catch (error) {
      console.error(`Error toggling course status ${courseId}:`, error);
      throw error;
    }
  }
};
