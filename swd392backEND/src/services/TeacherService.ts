import TeacherRepo from "../repository/TeacherRepo.ts";
import UserRepo from "../repository/UserRepo.ts";

class TeacherService {
    async getUserTeacherProfile(userId: string, teacherId: string) {
        const [user, teacher] = await Promise.all([
            UserRepo.getUserById(userId),
            TeacherRepo.getTeacherById(teacherId),
        ]);

        if (!user || !teacher) {
            return null;
        }

        const userObject = user.toObject();
        const { password, ...safeUser } = userObject;

        return {
            user: safeUser,
            teacher,
        };
    }
}

export default new TeacherService();
