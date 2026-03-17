import { UserRole } from './index';

export { UserRole };

export type UserStatus = 'active' | 'banned';
export type AdminTeacherRequestStatus = 'pending' | 'approved' | 'rejected';
export type MaterialType = 'file' | 'slide' | '2d_render' | 'quiz';
export type MaterialStatus = 'draft' | 'published' | 'reviewed' | 'deleted';

export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  date_create: string;
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

export interface RecentActivity {
  action: string;
  timestamp: string;
  details: Record<string, any>;
}

export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalClasses: number;
  totalEnrollments: number;
  activeStudents: number;
  activeTeachers: number;
  recentActivity: RecentActivity[];
}

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

export interface AdminTopicCourseInfo {
  course_name: string;
  grade_level: number;
}

export interface AdminTopic {
  _id: string;
  title: string;
  description?: string;
  course_id: string;
  content_json?: any;
  course?: AdminTopicCourseInfo;
}

export interface CreateTopicRequest {
  title: string;
  course_id: string;
  description?: string;
  content_json?: any;
}

export interface UpdateTopicRequest {
  title?: string;
  description?: string;
  content_json?: any;
}

export interface CourseTopicsResponse {
  course: AdminCourse & {
    topics: AdminTopic[];
  };
}

export interface DeleteTopicResponse {
  success: boolean;
  message: string;
  deletedCounts: Record<string, number>;
}

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

export interface AdminClassMaterialDetailResponse {
  success: boolean;
  data: AdminClassMaterial & {
    content?: any;
  };
}

export interface AdminClassMaterialCountResponse {
  count: number;
}

export interface QuestionOption {
  text: string;
}

export interface AdminQuestion {
  _id: string;
  quiz_id: string;
  title: string;
  options: QuestionOption[];
  correct_index: number;
  type: string;
}

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

export interface AdminClassStats {
  timeRange: '7days' | '30days' | '3months' | '1year' | 'all';
  status: 'active' | 'inactive' | 'all';
  totalClasses: number;
  byStatus: {
    active: number;
    inactive: number;
  };
  averageClassSize: number;
  topEnrolledClasses: Array<{
    className: string;
    enrollments: number;
    classId: string;
  }>;
  trend: Array<{
    date: string;
    count: number;
  }>;
}

export interface DeleteAdminClassResponse {
  success: boolean;
  message: string;
  deletedCounts: Record<string, number>;
}

export interface AdminQuiz {
  _id: string;
  title: string;
  type: string;
  available_date?: string;
  max_attempt_number?: number;
  end_date?: string;
  status: boolean;
}

export interface DeleteAdminQuizResponse {
  message: string;
  deleted: Record<string, number>;
}

export interface AdminTeacherRequest {
  _id: string;
  user_id: string;
  full_name: string;
  email: string;
  credential?: string;
  attachments?: string[];
  status: AdminTeacherRequestStatus;
  processed_by?: string;
  processed_at?: string;
  reason?: string;
  created_at: string;
}

export interface TeacherRequestsResponse {
  total: number;
  page: number;
  limit: number;
  data: AdminTeacherRequest[];
}

export interface TeacherRequestsParams {
  page?: number;
  limit?: number;
  status?: AdminTeacherRequestStatus | 'all';
  q?: string;
}

export interface ProcessTeacherRequestPayload {
  action: 'approve' | 'reject';
  reason?: string;
}

export interface ProcessTeacherRequestResponse {
  updatedRequest: {
    _id: string;
    status: AdminTeacherRequestStatus;
    processed_by?: string;
    processed_at?: string;
  };
  teacherCreated?: boolean;
}

export interface RecentClassItem {
  _id: string;
  class_name: string;
  teacher_name: string;
  student_count: number;
  material_count: number;
  status: 'active' | 'inactive';
  date_create: string;
}

export interface RecentMaterialItem {
  _id: string;
  title: string;
  class_name: string;
  teacher_name: string;
  type: MaterialType;
  view_count: number;
  dateCreate: string;
}

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

export interface ClassStatsParams {
  timeRange?: AdminClassStats['timeRange'];
  status?: AdminClassStats['status'];
}
