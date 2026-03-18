export interface Class {
  _id: string;
  class_name: string;
  keypass: string;
  course_id: string;
  teacher_id: string;
  img_cover_link: string;
  date_create: Date;
  status: "active" | "inactive" | "archived";
  course_name: string;
  description?: string;
  image_cover_id?: string;
  date_update?: Date;
}

export interface CreateClassData {
  class_name: string;
  description?: string;
  course_id: string;
}

export interface UpdateClassData {
  class_name?: string;
  description?: string;
  course_id?: string;
}

export interface ClassCompletionStat {
  course: string;
  completed: number;
  enrolled: number;
}

export interface UploadedFileRecord {
  file: string;
  course: string;
  createdAt: string;
  file_id: string;
  file_name: string;
  file_path: string;
}

export interface Topic {
  _id: string;
  topic_id: string;
  title: string;
  description?: string;
  order_num: number;
  course_id: string;
  date_create: Date;
  status: "active" | "inactive";
  classMaterials?: ClassMaterial[];
}

// Topic API operation interfaces
export interface CreateTopicData {
  title: string;
  description?: string;
  order_num: number;
  course_id: string;
}

export interface UpdateTopicData {
  title?: string;
  description?: string;
  order_num?: number;
  course_id?: string;
}

export interface TopicSearchParams {
  q?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedTopicsResponse {
  topics: Topic[];
  total: number;
  page: number;
  totalPages: number;
}

export type ClassMaterialType = "file" | "slide" | "2d_render" | "quiz";

export interface ClassMaterial {
  _id?: string;
  status: 'published' | 'draft' | 'reviewed' | 'deleted'
  type: ClassMaterialType;
  order_num: number;
  class_assign_id: string;
  title: string;
  dateUpdate: Date | null;
  dateCreate: Date;
  content: FileMaterial | SlideMaterial | Render2DMaterial | Quiz;
  is_ai_material: boolean;
  ai_content_id: string | null;
}

export interface FileMaterial {
  _id?: string;
  file_name: string;
  file_path: string;
}
// Question interface
export interface Question {
  _id?: string;
  quiz_id?: string;
  title: string;
  type: "multiple_choice" | "true_false";
  options: string[];
  correct_index: number;
  has2DVisualization?: boolean;
}
// Quiz interface
export interface Quiz {
  _id: string;
  material_id: string;
  title: string;
  keyword: string | null;
  type: "interactive" | "standard";
  available_date: Date | null;
  max_attempt_number: number | null;
  end_date: Date | null;
  status: boolean;
  questions?: Question[];
}

export interface Render2DMaterial {
  _id?: string;
  render_data: string;
}

export interface SlideMaterial {
  _id?: string;
  slide_name: string;
  file_path: string;
}

export interface DueAssignment {
  quiz_id: string;
  material_id: string;
  title: string;
  keyword: string | null;
  type: string;
  available_date: Date | null;
  max_attempt_number: number | null;
  end_date: Date | null;
  status: boolean;
}

export interface ClassCompletionStat {
  course: string;
  completed: number;
  enrolled: number;
  class_id: string;
  class_name: string;
}

export interface Student {
  _id: string;
  username: string;
  email: string;
  enrolled_date: Date;
  status: "active" | "inactive";
}

export interface StudentList {
  class_id: string;
  class_name: string;
  students: Student[];
}

export interface Course {
  _id: string;
  course_name: string;
  grade_level: number;
  description?: string;
  date_create: Date;
  status: "active" | "inactive";
  topics?: CourseTopicInfo[];
}

export interface CourseTopicInfo {
  topic_id: string;
  title: string;
  description?: string;
  order_num: number;
}

// Course API operation interfaces
export interface CreateCourseData {
  course_name: string;
  grade_level: number;
  description?: string;
}

export interface UpdateCourseData {
  course_name?: string;
  grade_level?: number;
  description?: string;
}

export interface CourseSearchParams {
  q?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedCoursesResponse {
  courses: Course[];
  total: number;
  page: number;
  totalPages: number;
}

// ClassMaterial DTO interfaces
export interface CreateClassMaterialDTO {
  topic_id?: string;
  type: ClassMaterialType;
  status?: "published" | "draft" | "reviewed" | "deleted";
  order_num?: number;
  class_assign_id: string;
  title: string;
  content_id?: string;
  is_ai_material?: boolean;
  ai_content_id?: string;
  isFlagged?: boolean;
  isFlaggable?: boolean;
  description: any;
}

export interface UpdateClassMaterialDTO {
  topic_id?: string;
  isFlagged?: boolean;
  isFlaggable?: boolean;
  type?: ClassMaterialType;
  status?: "published" | "draft" | "reviewed" | "deleted";
  order_num?: number;
  title?: string;
  content_id?: string;
  is_ai_material?: boolean;
  ai_content_id?: string;
  dateUpdate?: Date;
}

export interface ReorderMaterialsDTO {
  class_id: string;
  material_ids: string[];
}

export interface ToggleAiMaterialDTO {
  ai_content_id?: string;
}

export interface ChangeStatusDTO {
  status: "published" | "draft" | "reviewed" | "deleted";
}
