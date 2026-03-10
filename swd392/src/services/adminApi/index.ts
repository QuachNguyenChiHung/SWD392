// Admin API Services
// Central export for all admin-related API functions

export { adminUsersApi } from './usersApi';
export { adminDashboardApi } from './dashboardApi';
export { adminCoursesApi } from './coursesApi';
export { adminTopicsApi } from './topicsApi';
export { adminMaterialsApi } from './materialsApi';

// Re-export types for convenience
export type {
  AdminUser,
  CreateUserRequest,
  UpdateUserRequest,
  DashboardStats,
  AdminCourse,
  CreateCourseRequest,
  UpdateCourseRequest,
  AdminTopic,
  CreateTopicRequest,
  UpdateTopicRequest,
  AdminClassMaterial,
  AdminQuestion
} from '../../types/adminType';
