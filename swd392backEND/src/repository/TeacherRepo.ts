import { Teacher } from "../entities/Teacher.ts";

class TeacherRepo {
    async getTeacherById(teacherId: string) {
        return await Teacher.findById(teacherId);
    }

    async createTeacher(userId: string, credentialLink: string, fileName: string) {
        const teacher = new Teacher({
            user_id: userId,
            credential: credentialLink,
            fileName,
        });
        return await teacher.save();
    }

    async deleteTeacherByUserId(userId: string) {
        return await Teacher.findOneAndDelete({ user_id: userId });
    }
}

export default new TeacherRepo();
