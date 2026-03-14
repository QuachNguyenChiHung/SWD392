export interface ClassItem {
  _id: string;
  keypass: string;
  course_id: string;
  teacher_id: string;
  class_name: string;
  img_cover_link: string;
  keywords: string;
  date_create: string;
  status: string;
}
export interface File {
  _id: string;
  file_name: string;
  file_path: string;
}

export interface Slide {
  _id: string;
  slide_name: string;
  file_path: string;
}

export interface Topic {
  _id: string;
  course_id: string;
  title: string;
  description: string;
}

export interface Enrollment {
  _id: string;
  class_id: string | { _id: string; class_name: string };
  student_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  completed: boolean;
  date_join: string;
  date_end?: string;
  date_completed?: string;
}

export interface ProgressRecord {
  _id: string;
  enroll_id: string;
  classmaterial_id: string;
  completion_status: 'in_progress' | 'completed';
  date_completed: string | null;
}

export type ProgressData = ProgressRecord[];

export interface ClassMaterial {
  _id: string;
  class_id?: string;
  topic_id?: string;
  title: string;
  description?: string;
  type: 'pdf' | 'video' | 'image' | 'document' | 'link' | 'text' | 'audio' | 'file';
  file_url?: string;
  file_path?: string;
  order?: number;
  ai_generated?: boolean;
  status?: 'pending' | 'approved' | 'flagged';
}

export interface QuizAttempt {
  _id: string;
  quiz_id: string | { _id: string; title: string; type: string };
  user_id?: string;
  attempt_number: number;
  date: string;
  quizTitle?: string;
  record_json: {
    score?: number;
    time_taken?: number;
    answers?: number[];
  };
}

export interface DashboardStats {
  role: string;
  currentStudyingClasses: number;
  averageScore: number;
  achievements: any[];
  enrollments: Enrollment[];
}

export interface Quiz {
  _id: string;
  title: string;
  type: string;
  max_attempt_number: number;
  available_date: string;
  end_date: string;
  status: boolean;
}

export interface EnhancedClassItem extends ClassItem {
  enrollment?: Enrollment;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'student' | 'teacher' | 'admin' | 'moderator';
  status: 'active' | 'inactive' | 'suspended';
}

export interface StudentFeedback {
  _id: string;
  quiz_attempt_id?: string;
  class_id: string;
  user_id: string;
  content: string;
  rating?: number;
  date_created: string;
}

export interface TeacherFeedback {
  _id: string;
  student_id: string;
  class_id: string;
  teacher_id: string;
  content: string;
  date_created: string;
}

export interface Notification {
  _id: string;
  user_id: string;
  type: 'announcement' | 'message' | 'reminder' | 'grade';
  title: string;
  content: string;
  read: boolean;
  date_created: string;
}

export interface Course {
  _id: string;
  course_code: string;
  title: string;
  description?: string;
  instructor_id: string;
  topics?: string[];
  status: 'active' | 'inactive' | 'archived';
}

export interface EnrollmentFormData {
  keypass: string;
}

export interface FeedbackFormData {
  content: string;
  rating?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export interface FormState extends LoadingState {
  data?: Record<string, any>;
}

export interface MaterialProgress {
  material_id: string;
  completed: boolean;
  date_completed?: string;
}

export interface ClassStats {
  class_id: string;
  class_name: string;
  total_materials: number;
  completed_materials: number;
  progress_percentage: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  is_correct?: boolean;
}

export interface Question {
  _id: string;
  quiz_id: string;
  title: string;
  type: 'multiple_choice' | 'short_answer' | 'essay' | 'true_false';
  options?: QuestionOption[];
  correct_answer?: string | string[];
  points: number;
}

export interface ClassCardProps {
  class: EnhancedClassItem;
  onJoin?: () => void;
  onView?: (classId: string) => void;
  color: string;
  index: number;
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface ClassFilter {
  status?: 'active' | 'inactive' | 'completed';
  search?: string;
  sortBy?: 'date_create' | 'class_name';
  sortOrder?: 'asc' | 'desc';
}

export interface MaterialFilter {
  type?: ClassMaterial['type'];
  topic_id?: string;
  search?: string;
}