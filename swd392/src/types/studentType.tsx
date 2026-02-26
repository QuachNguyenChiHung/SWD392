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

export interface Topic {
    _id: string;
    course_id: string;
    title: string;
    description: string;
}
