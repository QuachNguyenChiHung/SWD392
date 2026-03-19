import { apiService } from '../api';

export const classMaterialProgressionApi = {
    // GET /api/progress/teacher/:enroll_id - Get all students' progress via enrollment (teacher)
    getClassProgressForTeacher: async (enrollId: string) => {
        try {
            const response = await apiService.get(`/progress/teacher/${enrollId}`);
            return response;
        } catch (error) {
            console.error('Error fetching class progress:', error);
            throw error;
        }
    },
};
