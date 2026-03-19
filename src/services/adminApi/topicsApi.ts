import { apiService } from '../api';
import type {
  CourseTopicsResponse,
  DeleteTopicResponse,
  AdminTopic,
  CreateTopicRequest,
  UpdateTopicRequest
} from '../../types/adminType';

/**
 * Admin Topics API
 * Endpoints: /api/topics
 */
export const adminTopicsApi = {
  /**
   * GET /api/topics/search - Search topics by keyword
   */
  searchTopics: async (keyword: string, page: number = 1): Promise<AdminTopic[]> => {
    try {
      const response = await apiService.get(
        `/topics/search?keyword=${encodeURIComponent(keyword)}&page=${page}`
      );
      return response;
    } catch (error) {
      console.error('Error searching topics:', error);
      throw error;
    }
  },

  /**
   * GET /api/topics/{id} - Get topic by ID
   */
  getTopicById: async (topicId: string): Promise<AdminTopic> => {
    try {
      const response = await apiService.get(`/topics/${topicId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching topic ${topicId}:`, error);
      throw error;
    }
  },

  /**
   * GET /api/topics/course/{course_id} - Get topics by course
   */
  getTopicsByCourse: async (courseId: string, page: number = 1): Promise<CourseTopicsResponse> => {
    try {
      const response = await apiService.get(`/topics/course/${courseId}?page=${page}`);
      return response;
    } catch (error) {
      console.error(`Error fetching topics for course ${courseId}:`, error);
      throw error;
    }
  },

  /**
   * POST /api/topics - Create new topic
   */
  createTopic: async (topicData: CreateTopicRequest): Promise<AdminTopic> => {
    try {
      const response = await apiService.post('/topics', topicData);
      return response;
    } catch (error) {
      console.error('Error creating topic:', error);
      throw error;
    }
  },

  /**
   * PUT /api/topics/{id} - Update topic
   */
  updateTopic: async (topicId: string, topicData: UpdateTopicRequest): Promise<AdminTopic> => {
    try {
      const response = await apiService.put(`/topics/${topicId}`, topicData);
      return response;
    } catch (error) {
      console.error(`Error updating topic ${topicId}:`, error);
      throw error;
    }
  },

  deleteTopic: async (topicId: string): Promise<DeleteTopicResponse> => {
    try {
      const response = await apiService.delete(`/topics/${topicId}`);
      return response;
    } catch (error) {
      console.error(`Error deleting topic ${topicId}:`, error);
      throw error;
    }
  }
};
