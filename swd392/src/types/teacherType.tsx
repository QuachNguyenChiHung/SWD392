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
  course_name: string;
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
  title: string;
  class: string;
  description: string;
  belongToCourse: string;
  ClassMaterialType: ClassMaterial[] | null;
}

export type ClassMaterialType = "file" | "slide" | "2d_render" | "quiz";

export interface ClassMaterial {
  material_id: string;
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
  file_id: string;
  file_name: string;
  file_path: string;
}
// Question interface
export interface Question {
  id: string;
  content: string;
  type: "multiple-choice" | "true-false" | "short-answer";
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  has2DVisualization?: boolean;
}
// Quiz interface
export interface Quiz {
  quiz_id: string;
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
  render_id: string;
  render_data: string;
}

export interface SlideMaterial {
  slide_id: string;
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
  student_id: string;
  student_name: string;
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
  course_id: string;
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
