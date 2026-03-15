import { apiService } from '../api';
import type {
  AdminUser,
  CreateUserRequest,
  UpdateUserRequest,
  UsersListResponse,
  SearchUsersParams,
  PaginationParams
} from '../../types/adminType';

/**
 * Admin Users API
 * Endpoints: /api/users
 */
export const adminUsersApi = {
  /**
   * GET /api/users/search - Search users by keyword
   */
  searchUsers: async (params: SearchUsersParams): Promise<UsersListResponse> => {
    try {
      const { keyword, page = 1, limit = 10 } = params;
      const response = await apiService.get(
        `/users/search?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`
      );

      if (Array.isArray(response)) {
        const hasNext = response.length === limit;
        return {
          users: response,
          total: hasNext ? page * limit + 1 : (page - 1) * limit + response.length,
        };
      }

      return response;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  /**
   * GET /api/users - Get all users (paginated)
   */
  getAllUsers: async (params: PaginationParams = {}): Promise<UsersListResponse> => {
    try {
      const { page = 1, limit = 10 } = params;
      const response = await apiService.get(`/users?page=${page}&limit=${limit}`);
      
      // Backend returns array directly, wrap it in expected format
      if (Array.isArray(response)) {
        const hasNext = response.length === limit;
        return {
          users: response,
          total: hasNext ? page * limit + 1 : (page - 1) * limit + response.length
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  /**
   * GET /api/users/{id} - Get user by ID
   */
  getUserById: async (userId: string): Promise<AdminUser> => {
    try {
      const response = await apiService.get(`/users/${userId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * POST /api/users - Create new user (Teacher/Moderator)
   */
  createUser: async (userData: CreateUserRequest): Promise<AdminUser> => {
    try {
      const response = await apiService.post('/users', userData);
      return response;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * PATCH /api/users/{id} - Update user info + role
   */
  updateUser: async (userId: string, userData: UpdateUserRequest): Promise<AdminUser> => {
    try {
      const response = await apiService.patch(`/users/${userId}`, userData);
      return response;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * PATCH /api/users/{id}/status - Ban/Unban user
   */
  toggleUserStatus: async (userId: string): Promise<AdminUser> => {
    try {
      const response = await apiService.patch(`/users/${userId}/status`, {});
      return response;
    } catch (error) {
      console.error(`Error toggling user status ${userId}:`, error);
      throw error;
    }
  },

  /**
   * DELETE /api/users/{id} - Delete user (if backend supports)
   * Note: Not in swagger, but included for completeness
   */
  deleteUser: async (userId: string): Promise<void> => {
    try {
      await apiService.delete(`/users/${userId}`);
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  }
};
