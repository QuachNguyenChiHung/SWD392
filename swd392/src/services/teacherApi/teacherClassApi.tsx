import { apiService } from '../api';
import type { Class, CreateClassData, UpdateClassData } from '../../types/teacherType';

// API functions for teacher class management
export const teacherClassApi = {
    // Get all classes for the authenticated teacher
    getClassesByTeacher: async (page = 1, viewHidden = true): Promise<Class[]> => {
        try {
            const response = await apiService.get(`/teacher/class?page=${page}&view_hidden=${viewHidden}`);
            return response;
        } catch (error) {
            console.error('Error fetching teacher classes:', error);
            throw error;
        }
    },

    // Get a specific class by ID
    getClassById: async (classId: string): Promise<Class> => {
        try {
            const response = await apiService.get(`/class/${classId}`);
            return response;
        } catch (error) {
            console.error(`Error fetching class ${classId}:`, error);
            throw error;
        }
    },

    // Create a new class
    createClass: async (classData: CreateClassData): Promise<Class> => {
        try {
            const response = await apiService.post('/class', classData);
            return response;
        } catch (error) {
            console.error('Error creating class:', error);
            throw error;
        }
    },

    // Update an existing class
    updateClass: async (classId: string, classData: UpdateClassData): Promise<Class> => {
        try {
            const response = await apiService.put(`/class/${classId}`, classData);
            return response;
        } catch (error) {
            console.error(`Error updating class ${classId}:`, error);
            throw error;
        }
    },

    // Delete a class
    deleteClass: async (classId: string) => {
        try {
            const response = await apiService.delete(`/class/${classId}`);
            return response;
        } catch (error) {
            console.error(`Error deleting class ${classId}:`, error);
            throw error;
        }
    },

    // Get students in a specific class
    getStudentsByClass: async (classId: string) => {
        try {
            const response = await apiService.get(`/class/${classId}/students`);
            return response;
        } catch (error) {
            console.error(`Error fetching students for class ${classId}:`, error);
            throw error;
        }
    },

    // Generate keypass for a class
    generateKeypass: async (classId: string) => {
        try {
            const response = await apiService.post(`/class/${classId}/generate-keypass`, {});
            return response;
        } catch (error) {
            console.error(`Error generating keypass for class ${classId}:`, error);
            throw error;
        }
    },

    // Upload image cover
    uploadImageCover: async (imageFile: File) => {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await apiService.uploadFile('/teacher/upload-image', formData);
            return response;
        } catch (error) {
            console.error('Error uploading image cover:', error);
            throw error;
        }
    },

    // Update image cover
    updateImageCover: async (imageFile: File, imageUrl: string) => {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('url', imageUrl);

            const response = await apiService.updateFileUpload('/teacher/update-image', formData);
            return response;
        } catch (error) {
            console.error('Error updating image cover:', error);
            throw error;
        }
    },

    // Delete image cover
    deleteImageCover: async (imageId: string) => {
        try {
            const response = await apiService.delete('/teacher/delete-image', {
                data: { imageId },
            });
            return response;
        } catch (error) {
            console.error('Error deleting image cover:', error);
            throw error;
        }
    },
};

export default teacherClassApi;
