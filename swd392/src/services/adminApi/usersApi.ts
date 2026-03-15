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
   * Aggregate total users by role across all pages.
   */
  getUserRoleCounts: async (): Promise<{ students: number; teachers: number; moderators: number; admins: number }> => {
    const PAGE_SIZE = 50;
    const MAX_PAGES = 500;
    let page = 1;
    const seenUserIds = new Set<string>();

    const counts = {
      students: 0,
      teachers: 0,
      moderators: 0,
      admins: 0,
    };

    while (page <= MAX_PAGES) {
      const { users, total } = await adminUsersApi.getAllUsers({ page, limit: PAGE_SIZE });

      if (!Array.isArray(users) || users.length === 0) {
        break;
      }

      let newUsersCount = 0;

      for (const user of users) {
        if (!user?._id || seenUserIds.has(user._id)) {
          continue;
        }

        seenUserIds.add(user._id);
        newUsersCount += 1;

        switch (user.role) {
          case 'student':
            counts.students += 1;
            break;
          case 'teacher':
            counts.teachers += 1;
            break;
          case 'moderator':
            counts.moderators += 1;
            break;
          case 'admin':
            counts.admins += 1;
            break;
          default:
            break;
        }
      }

      if (typeof total === 'number' && total > 0 && seenUserIds.size >= total) {
        break;
      }

      // Prevent infinite loop when backend repeats same page data.
      if (newUsersCount === 0) {
        break;
      }

      page += 1;
    }

    return counts;
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
