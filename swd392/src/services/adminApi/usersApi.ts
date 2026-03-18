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
      const { keyword, page = 1, limit = 12 } = params;
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
      const { page = 1, limit = 12 } = params;
      const response = await apiService.get(`/users?page=${page}&limit=${limit}`);

      // Variant 1: response is an array of users
      if (Array.isArray(response)) {
        const hasNext = response.length === limit;
        return {
          users: response,
          total: hasNext ? page * limit + 1 : (page - 1) * limit + response.length,
        };
      }

      // Variant 2: response is { users, total }
      if (Array.isArray(response?.users)) {
        return {
          users: response.users,
          total: typeof response.total === 'number' ? response.total : response.users.length,
        };
      }

      // Variant 3: response is { data: { users, total } }
      if (Array.isArray(response?.data?.users)) {
        return {
          users: response.data.users,
          total: typeof response.data.total === 'number' ? response.data.total : response.data.users.length,
        };
      }

      // Variant 4: response is { data: [...] }
      if (Array.isArray(response?.data)) {
        const users = response.data;
        const hasNext = users.length === limit;
        return {
          users,
          total: hasNext ? page * limit + 1 : (page - 1) * limit + users.length,
        };
      }

      return {
        users: [],
        total: 0,
      };
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  /**
   * Aggregate total users by role across all pages.
   */
  getUserRoleCounts: async (): Promise<{ students: number; teachers: number; moderators: number; admins: number }> => {
    const PAGE_SIZE = 12;
    const MAX_PAGES = 500;
    let page = 1;
    const seenUserIds = new Set<string>();
    let lastPageSignature = '';
    let stagnantPages = 0;

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
      const currentSignature = users.map((user) => user?._id).filter(Boolean).join('|');

      if (currentSignature && currentSignature === lastPageSignature) {
        stagnantPages += 1;
      } else {
        stagnantPages = 0;
      }

      lastPageSignature = currentSignature;

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

      // Prevent infinite loop when backend keeps returning the same page payload.
      if (stagnantPages >= 2 || newUsersCount === 0) {
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
   * POST /api/users - Create new user (supports teacher credential PDF upload)
   */
  createUser: async (userData: CreateUserRequest): Promise<AdminUser> => {
    try {
      const formData = new FormData();
      formData.append('username', userData.username);
      formData.append('email', userData.email);
      formData.append('password', userData.password);
      formData.append('role', userData.role);

      if (userData.role === 'teacher' && userData.credentialFile) {
        formData.append('credentialFile', userData.credentialFile);
      }

      const response = await apiService.uploadFile('/users', formData);
      return response;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * PATCH /api/users/{id} - Update user info (role change is blocked by backend)
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
