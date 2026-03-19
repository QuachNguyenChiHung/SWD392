import { apiService } from '../api';
import type {
    Topic,
    CreateTopicData,
    UpdateTopicData,
    TopicSearchParams,
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

    // Create a new topic (admin only)
    createTopic: async (topicData: CreateTopicData): Promise<Topic> => {
        try {
            const response = await apiService.post('/topics', topicData);
            return response;
        } catch (error) {
            console.error('Error creating topic:', error);
            throw error;
        }
    },

    // Update an existing topic (admin only)
    updateTopic: async (topicId: string, topicData: UpdateTopicData): Promise<Topic> => {
        try {
            const response = await apiService.put(`/topics/${topicId}`, topicData);
            return response;
        } catch (error) {
            console.error(`Error updating topic ${topicId}:`, error);
            throw error;
        }
    },

    // Search topics by keyword
    searchTopics: async (params: TopicSearchParams): Promise<PaginatedTopicsResponse> => {
        try {
            const searchParams = new URLSearchParams();

            if (params.q) searchParams.append('q', params.q);
            if (params.page) searchParams.append('page', params.page.toString());
            if (params.limit) searchParams.append('limit', params.limit.toString());

            const queryString = searchParams.toString();
            const url = queryString ? `/topics/search?${queryString}` : '/topics/search';

            const response = await apiService.get(url);
            return response;
        } catch (error) {
            console.error('Error searching topics:', error);
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
