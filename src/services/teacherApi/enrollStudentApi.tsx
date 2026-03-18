import { apiService } from '../api';

export const enrollStudentApi = {
    // POST /api/enroll/invite/:class_id - Teacher invites student to class
    inviteStudent: async (classId: string, studentId: string) => {
        try {
            const response = await apiService.post(`/enroll/invite/${classId}`, { student_id: studentId });
            return response;
        } catch (error) {
            console.error('Error inviting student:', error);
            throw error;
        }
    },

    // GET /teacher/enroll/:class_id - Get all enrollments from a class (paginated, teachers only)
    getEnrollmentsByClass: async (classId: string, page: number = 1) => {
        try {
            const response = await apiService.get(`/teacher/enroll/${classId}`, { params: { page } });
            return response;
        } catch (error) {
            console.error('Error fetching enrollments:', error);
            throw error;
        }
    },
};
