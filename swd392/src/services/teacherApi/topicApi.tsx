import { apiService } from '../api';
import type {
    Topic,
    PaginatedTopicsResponse
} from '../../types/teacherType';

// API functions for topic management
export const topicApi = {
    // Get a specific topic by ID
    getTopicById: async (topicId: string): Promise<Topic> => {
        try {
            const response = await apiService.get(`/topics/${topicId}`);
            return response;
        } catch (error) {
            console.error(`Error fetching topic ${topicId}:`, error);
            throw error;
        }
    },

    // Get topics from a specific course (paginated)
    getTopicsByCourse: async (courseId: string, page: number = 1): Promise<PaginatedTopicsResponse> => {
        try {
            const response = await apiService.get(`/topics/course/${courseId}?page=${page}`);
            return response;
        } catch (error) {
            console.error(`Error fetching topics for course ${courseId}:`, error);
            throw error;
        }
    },

    // Get active topics only (convenience method)
    getActiveTopicsByCourse: async (courseId: string, page: number = 1): Promise<PaginatedTopicsResponse> => {
        try {
            const response = await apiService.get(`/topics/course/${courseId}?page=${page}&status=active`);
            return response;
        } catch (error) {
            console.error(`Error fetching active topics for course ${courseId}:`, error);
            throw error;
        }
    }
};
