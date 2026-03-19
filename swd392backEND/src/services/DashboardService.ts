import { User } from "../entities/User.ts";
import { Class } from "../entities/Class.ts";
import { ClassMaterial } from "../entities/ClassMaterial.ts";
import { Enroll } from "../entities/Enroll.ts";
import { Teacher } from "../entities/Teacher.ts";
import { AiContent } from "../entities/AiContent.ts";
import { Feedback } from "../entities/Feedback.ts";
import { QuizAttempt } from "../entities/QuizAttempt.ts";
import { Result } from "../entities/Result.ts";
import mongoose from "mongoose";

class DashboardService {
    // Admin Dashboard
    async getAdminStats() {
        const [totalUsers, totalClasses, totalLessons] = await Promise.all([
            User.countDocuments(),
            Class.countDocuments(),
            ClassMaterial.countDocuments()
        ]);
        return { totalUsers, totalClasses, totalLessons };
    }

    // Moderator Dashboard
    async getModeratorStats() {
        const [
            pendingContent, 
            pendingCount,
            violationReports, 
            violationCount, 
            suspendedAccounts, 
            suspendedCount,
            totalMaterials,
            totalTeachers,
            totalStudents,
            totalTopics,
            totalClasses
        ] = await Promise.all([
            AiContent.find({ review_status: "pending" }).populate('ai_request_id').limit(50),
            AiContent.countDocuments({ review_status: "pending" }),
            Feedback.find({ $or: [{ rating: { $lte: 2 } }, { comment: { $regex: /vi phạm|báo cáo|inappropriate|spam/i } }] })
                .populate('user_id', 'username email').populate('material_id', 'title type').sort({ date: -1 }).limit(50),
            Feedback.countDocuments({ $or: [{ rating: { $lte: 2 } }, { comment: { $regex: /vi phạm|báo cáo/i } }] }),
            User.find({ status: "banned" }).select('username email role date_create').limit(50),
            User.countDocuments({ status: "banned" }),
            ClassMaterial.countDocuments(),
            User.countDocuments({ role: "teacher" }),
            User.countDocuments({ role: "student" }),
            mongoose.model('Topic').countDocuments(),
            Class.countDocuments()
        ]);

        return { 
            pendingContent, 
            pendingCount, 
            violationReports, 
            violationCount, 
            suspendedAccounts, 
            suspendedCount,
            totalMaterials,
            totalTeachers,
            totalStudents,
            totalTopics,
            totalClasses
        };
    }

    // Student Dashboard
    async getStudentStats(userId: string) {
        const enrollments = await Enroll.find({ student_id: new mongoose.Types.ObjectId(userId) })
            .populate({ path: 'class_id', populate: { path: 'course_id teacher_id' } });

        const currentStudyingClasses = enrollments.filter(e => e.status === 'in_progress').length;
        const quizAttempts = await QuizAttempt.find({ user_id: new mongoose.Types.ObjectId(userId) });

        let totalScore = 0, totalAttempts = 0;
        for (const attempt of quizAttempts) {
            const results = await Result.find({ quiz_attempt_id: attempt._id });
            if (results.length > 0) {
                totalScore += (results.filter(r => r.isCorrect).length / results.length) * 100;
                totalAttempts++;
            }
        }
        const averageScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;

        const completedCount = enrollments.filter(e => e.status === 'completed').length;
        const achievements = [
            completedCount >= 1 && { id: 'first_class', name: 'First Class', earned: true },
            completedCount >= 5 && { id: 'dedicated', name: 'Dedicated Learner', earned: true },
            averageScore >= 80 && { id: 'high_achiever', name: 'High Achiever', earned: true },
            totalAttempts >= 10 && { id: 'quiz_master', name: 'Quiz Master', earned: true }
        ].filter(Boolean);

        return { currentStudyingClasses, averageScore, achievements, enrollments };
    }

    // Teacher Dashboard
    async getTeacherStats(userId: string) {
        const teacherRecord = await Teacher.findOne({ user_id: userId });
        if (!teacherRecord) throw new Error("Teacher not found");

        const teacherClasses = await Class.find({
            teacher_id: teacherRecord._id,
            status: { $ne: "deleted" }
        }).populate('course_id');
        const classIds = teacherClasses.map(c => c._id);

        const classProgress = await Promise.all(
            teacherClasses.map(async (cls) => {
                const [total, completed] = await Promise.all([
                    Enroll.countDocuments({ class_id: cls._id }),
                    Enroll.countDocuments({ class_id: cls._id, status: "completed" })
                ]);
                return {
                    name: cls.class_name,
                    completionMessage: `${completed} in ${total} students have finished class: ${cls.class_name}`,
                    completed,
                    total
                };
            })
        );

        return { totalClasses: teacherClasses.length, classProgress };
    }
}

export default new DashboardService();
