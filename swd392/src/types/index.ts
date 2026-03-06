// User roles
export const UserRole = {
  GUEST: 'guest',
  STUDENT: 'student',
  TEACHER: 'teacher',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt?: Date;
  status?: 'active' | 'inactive' | 'suspended';
}

// Teacher Request interface
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

// System Stats interface for Admin Dashboard
export interface SystemStats {
  totalUsers: number;
  totalClasses: number;
  totalMaterials: number;
  totalStudents: number;
  totalTeachers: number;
  totalModerators: number;
  activeClasses: number;
}

// Activity Log interface
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: Date;
  type: 'user' | 'class' | 'material' | 'system';
}

// Auth state interface
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Class interface
export interface Class {
  class_id: string;
  class_name: string;
  keypass: string;
  course_id: string;
  teacher_id: string;
  img_cover_link: string;
  keywords: string;
  date_create: Date;
  status: "active" | "inactive" | "archived";
}

// Lesson interface
export interface Lesson {
  id: string;
  classId: string;
  title: string;
  content: string;
  isAIGenerated: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}




// Dashboard helper types


export interface ScheduleSlot {
  slot: string;
  time: string;
  course: string;
  topic: string;
  place: string;
}

export interface DueAssignment {
  quiz_id: number;
  material_id: number;
  title: string;
  keyword: string | null;
  type: string;
  available_date: Date | null;
  max_attempt_number: number | null;
  end_date: Date | null;
  status: boolean;
}

export interface UploadedFileRecord {
  file: string;
  course: string;
  createdAt: string;
}

export interface GradeSummary {
  title: string;
  course: string;
  category: string;
  score: string;
}

export interface Announcement {
  title: string;
  detail: string;
  timestamp: string;
}

