import { apiService } from '../api';
import type { Class, CreateClassData, UpdateClassData } from '../../types/teacherType';

// Get the API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// API functions for teacher class management
export const teacherClassApi = {
    // Get all classes for the authenticated teacher
    getClassesByTeacher: async (): Promise<Class[]> => {
        try {
            const response = await apiService.get('/teacher/class');
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

            // Use fetch directly for file upload since apiService doesn't handle FormData well
            const response = await fetch(`${API_BASE_URL}/teacher/upload-image`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error uploading image cover:', error);
            throw error;
        }
    },

    // Update image cover
    updateImageCover: async (imageFile: File, imageId: string) => {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('imageId', imageId);

            // Use fetch directly for file upload since apiService doesn't handle FormData well
            const response = await fetch(`${API_BASE_URL}/teacher/update-image`, {
                method: 'PUT',
                body: formData,
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating image cover:', error);
            throw error;
        }
    },

    // Delete image cover
    deleteImageCover: async (imageId: string) => {
        try {
            // Use fetch directly to send imageId in request body for DELETE
            const response = await fetch(`${API_BASE_URL}/teacher/delete-image`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageId }),
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting image cover:', error);
            throw error;
        }
    },
};

export default teacherClassApi;
