import { apiService } from '../api';

export interface TeacherProfileResponse {
    user: {
        _id?: string;
        id?: string;
        username: string;
        email: string;
        role: 'teacher' | 'student' | 'admin' | 'moderator';
        status: 'active' | 'banned' | 'deleted';
        date_create?: string | Date;
    };
    teacher: {
        _id: string;
        user_id: string;
        credential?: string | null;
        fileName?: string | null;
    };
}

export const teacherProfileApi = {
    getTeacherProfile: async (): Promise<TeacherProfileResponse> => {
        try {
            const response = await apiService.get('/teacher/profile');
            return response;
        } catch (error) {
            console.error('Error fetching teacher profile:', error);
            throw error;
        }
    },

    updateMyPassword: async (password: string) => {
        try {
            const response = await apiService.patch('/teacher/profile/password', { password });
            return response;
        } catch (error) {
            console.error('Error updating teacher password:', error);
            throw error;
        }
    },
};

export default teacherProfileApi;
