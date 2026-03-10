// ===============================
// ADMIN-SPECIFIC TYPES
// Matching Backend API Swagger Specification
// ===============================

// Re-export shared types from index.ts
import { UserRole } from './index';
export { UserRole };

// User status
export type UserStatus = 'active' | 'banned';

// ===============================
// USER TYPES (matching /api/users)
// ===============================

export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  date_create: string; // ISO string from backend
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: UserRole;
}

export interface UsersListResponse {
  users: AdminUser[];
  total: number;
}

export interface SearchUsersParams {
  keyword: string;
  page?: number;
  limit?: number;
}

// ===============================
// DASHBOARD TYPES (matching /api/dashboard)
// ===============================

export interface DashboardStats {
  totalUsers: number;
  totalCourses?: number;
  totalClasses: number;
  totalEnrollments?: number;
  activeStudents?: number;
  activeTeachers?: number;
  recentActivity?: RecentActivity[];
}

export interface RecentActivity {
  action: string;
  timestamp: string;
  details: Record<string, any>;
}

// ===============================
// COURSE TYPES (matching /api/courses)
// ===============================

export interface AdminCourse {
  _id: string;
  course_name: string;
  grade_level: number;
  status: 'active' | 'inactive';
  date_create: string;
  change_log?: any;
}

export interface CreateCourseRequest {
  course_name: string;
  grade_level: number;
}

export interface UpdateCourseRequest {
  course_name?: string;
  grade_level?: number;
  status?: 'active' | 'inactive';
}

// ===============================
// TOPIC TYPES (matching /api/topics)
// ===============================

export interface AdminTopic {
  _id: string;
  title: string;
  description?: string;
  course_id: string;
  content_json?: any;
}

export interface CreateTopicRequest {
  title: string;
  course_id: string;
  description?: string;
}

export interface UpdateTopicRequest {
  title?: string;
  description?: string;
}

// ===============================
// CLASS MATERIAL TYPES (matching /api/class-materials/all)
// ===============================

export type MaterialType = 'file' | 'slide' | '2d_render' | 'quiz';
export type MaterialStatus = 'draft' | 'published' | 'reviewed' | 'deleted';

export interface AdminClassMaterial {
  _id: string;
  title: string;
  type: MaterialType;
  order_num: number;
  class_assign_id: string;
  topic_id: string;
  content_id: string;
  status: MaterialStatus;
  isFlagged: boolean;
  isFlaggable: boolean;
  is_ai_material: boolean;
  ai_content_id?: string;
  dateCreate: string;
  dateUpdate: string;
}

// ===============================
// QUESTION TYPES (matching /api/questions)
// ===============================

export interface AdminQuestion {
  _id: string;
  quiz_id: string;
  options: QuestionOption[];
  correct_index: number;
  type: string;
}

export interface QuestionOption {
  text: string;
}

// ===============================
// CLASS TYPES (for system management)
// ===============================

export interface AdminClass {
  _id: string;
  keypass: string;
  course_id: string;
  teacher_id: string;
  class_name: string;
  img_cover_link?: string;
  status: 'active' | 'inactive';
  date_create: string;
}

// ===============================
// TEACHER REQUEST TYPES
// ===============================

export interface TeacherRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  requestDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

// ===============================
// UI HELPER TYPES
// ===============================

// For displaying recent classes in dashboard
export interface RecentClassItem {
  _id: string;
  class_name: string;
  teacher_name: string;
  student_count: number;
  material_count: number;
  status: 'active' | 'inactive';
  date_create: string;
}

// For displaying recent materials in dashboard
export interface RecentMaterialItem {
  _id: string;
  title: string;
  class_name: string;
  teacher_name: string;
  type: MaterialType;
  view_count: number;
  dateCreate: string;
}

// ===============================
// PAGINATION TYPES
// ===============================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages?: number;
}
