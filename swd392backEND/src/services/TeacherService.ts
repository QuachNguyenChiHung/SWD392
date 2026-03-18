import TeacherRepo from '../repository/TeacherRepo.ts';

class TeacherService {
    /** Returns teacher document with populated user (password excluded by repo). */
    async getTeacherById(id: string) {
        return await TeacherRepo.getById(id);
    }

    async getTeacherByUserId(userId: string) {
        return await TeacherRepo.getByUserId(userId);
    }
}

export default new TeacherService();
