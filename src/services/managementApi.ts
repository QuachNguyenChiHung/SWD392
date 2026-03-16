import { apiService } from "./api";

// Course Management
export const getAllCourses = (page: number = 1) => 
    apiService.get(`/courses?page=${page}`);

export const createCourse = (data: { course_name: string; description?: string }) => 
    apiService.post('/courses', data);

export const updateCourse = (id: string, data: { course_name?: string; description?: string }) => 
    apiService.put(`/courses/${id}`, data);

export const deleteCourse = (id: string) => 
    apiService.delete(`/courses/${id}`);

export const toggleCourseStatus = (id: string) => 
    apiService.patch(`/courses/${id}/toggle-status`);

// Class Management
export const searchClasses = (keyword: string, page: number = 1) => 
    apiService.get(`/classes/search?q=${keyword}&page=${page}`);

export const deleteClass = (id: string) => 
    apiService.delete(`/admin/classes/${id}`);

export const getAdminClassStats = () => 
    apiService.get('/admin/stats/classes');

// Topic Management
export const getTopicsByCourse = (courseId: string, page: number = 1) => 
    apiService.get(`/topics/course/${courseId}?page=${page}`);

export const createTopic = (data: { topic_name: string; course_id: string; description?: string; order_num: number }) => 
    apiService.post('/topics', data);

export const updateTopic = (id: string, data: { topic_name?: string; description?: string; order_num?: number }) => 
    apiService.put(`/topics/${id}`, data);

export const deleteTopic = (id: string) => 
    apiService.delete(`/topics/${id}`);
