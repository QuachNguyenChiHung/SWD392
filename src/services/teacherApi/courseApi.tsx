import { apiService } from '../api';
import type {
    Course,
    CreateCourseData,
    UpdateCourseData,
    CourseSearchParams,
    PaginatedCoursesResponse
} from '../../types/teacherType';

// API functions for course management
export const courseApi = {
    // Get all courses with pagination
    getAllCourses: async (page: number = 1): Promise<PaginatedCoursesResponse> => {
        try {
            const response = await apiService.get(`/courses?page=${page}`);
            return response;
        } catch (error) {
            console.error('Error fetching courses:', error);
            throw error;
        }
    },

    // Get a specific course by ID
    getCourseById: async (courseId: string): Promise<Course> => {
        try {
            const response = await apiService.get(`/courses/${courseId}`);
            return response;
        } catch (error) {
            console.error(`Error fetching course ${courseId}:`, error);
            throw error;
        }
    },

    // Create a new course (admin only)
    createCourse: async (courseData: CreateCourseData): Promise<Course> => {
        try {
            const response = await apiService.post('/courses', courseData);
            return response;
        } catch (error) {
            console.error('Error creating course:', error);
            throw error;
        }
    },

    // Update an existing course (admin only)
    updateCourse: async (courseId: string, courseData: UpdateCourseData): Promise<Course> => {
        try {
            const response = await apiService.put(`/courses/${courseId}`, courseData);
            return response;
        } catch (error) {
            console.error(`Error updating course ${courseId}:`, error);
            throw error;
        }
    },

    // Delete a course (admin only)
    deleteCourse: async (courseId: string): Promise<void> => {
        try {
            await apiService.delete(`/courses/${courseId}`);
        } catch (error) {
            console.error(`Error deleting course ${courseId}:`, error);
            throw error;
        }
    },

    // Toggle course status (admin only)
    toggleCourseStatus: async (courseId: string): Promise<Course> => {
        try {
            const response = await apiService.patch(`/courses/${courseId}/toggle-status`, {});
            return response;
        } catch (error) {
            console.error(`Error toggling status for course ${courseId}:`, error);
            throw error;
        }
    },

    // Search courses by keyword
    searchCourses: async (params: CourseSearchParams): Promise<PaginatedCoursesResponse> => {
        try {
            const searchParams = new URLSearchParams();

            if (params.q) searchParams.append('q', params.q);
            if (params.page) searchParams.append('page', params.page.toString());
            if (params.limit) searchParams.append('limit', params.limit.toString());

            const queryString = searchParams.toString();
            const url = queryString ? `/courses/search?${queryString}` : '/courses/search';

            const response = await apiService.get(url);
            return response;
        } catch (error) {
            console.error('Error searching courses:', error);
            throw error;
        }
    },

    // Get courses by grade level (convenience method)
    getCoursesByGrade: async (gradeLevel: number, page: number = 1): Promise<PaginatedCoursesResponse> => {
        try {
            const response = await apiService.get(`/courses?page=${page}&grade_level=${gradeLevel}`);
            return response;
        } catch (error) {
            console.error(`Error fetching courses for grade ${gradeLevel}:`, error);
            throw error;
        }
    },

    // Get active courses only (convenience method)
    getActiveCourses: async (page: number = 1): Promise<PaginatedCoursesResponse> => {
        try {
            const response = await apiService.get(`/courses?page=${page}&status=active`);
            return response;
        } catch (error) {
            console.error('Error fetching active courses:', error);
            throw error;
        }
    }
};
