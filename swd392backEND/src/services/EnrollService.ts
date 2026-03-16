import EnrollRepo from "../repository/EnrollRepo.ts";
import { Class } from "../entities/Class.ts";
import type { CreateEnrollDTO, EnrollByKeypassDTO, InviteStudentDTO } from "../dto/EnrollDTO.ts";
import ProgressClassMaterialService from "./ProgressClassMaterialService.ts";

class EnrollService {
    async createEnrollment(enrollData: CreateEnrollDTO) {
        // Validate keypass with class
        const classData = await Class.findById(enrollData.class_id);
        if (enrollData.class_id) {

            if (!classData) {
                return { error: "Class not found" };
            }
        }

        // Check if already enrolled
        const existingEnroll = await EnrollRepo.findEnrollByUserAndClass(
            enrollData.student_id,
            enrollData.class_id as string
        );

        if (existingEnroll) {
            return { error: "Student already enrolled in this class" };
        }

        const newEnroll = await EnrollRepo.createEnroll(enrollData);

        // Eager: create progress records for all active materials in the class
        await ProgressClassMaterialService.bulkCreateForEnrollment(
            newEnroll._id.toString(),
            enrollData.class_id
        );

        return newEnroll;
    }

    // Student enrolls by keypass
    async enrollByKeypass(data: EnrollByKeypassDTO) {
        const classData = await Class.findOne({ keypass: data.keypass });
        if (!classData) {
            return { error: "Invalid keypass - class not found" };
        }

        const classId = classData._id.toString();

        const existingEnroll = await EnrollRepo.findEnrollByUserAndClass(data.student_id, classId);
        if (existingEnroll) {
            return { error: "Student already enrolled in this class" };
        }

        const newEnroll = await EnrollRepo.createEnroll({ student_id: data.student_id, class_id: classId });

        await ProgressClassMaterialService.bulkCreateForEnrollment(
            newEnroll._id.toString(),
            classId
        );

        return newEnroll;
    }

    // Teacher invites student to class
    async inviteStudent(data: InviteStudentDTO, teacherId: string) {
        const classData = await Class.findById(data.class_id);
        if (!classData) {
            return { error: "Class not found" };
        }

        if (classData.teacher_id.toString() !== teacherId) {
            return { error: "Only the teacher of this class can invite students" };
        }

        const existingEnroll = await EnrollRepo.findEnrollByUserAndClass(data.student_id, data.class_id);
        if (existingEnroll) {
            return { error: "Student already enrolled in this class" };
        }

        const newEnroll = await EnrollRepo.createEnroll({ student_id: data.student_id, class_id: data.class_id });

        await ProgressClassMaterialService.bulkCreateForEnrollment(
            newEnroll._id.toString(),
            data.class_id
        );

        return newEnroll;
    }

    async getEnrollmentsByClass(classId: string, page: number = 1) {
        return await EnrollRepo.getEnrollsByClassId(classId, page);
    }

    async completeEnrollment(enrollId: string, teacherId: string) {
        // Get the enrollment to find the class
        const enroll = await EnrollRepo.getEnrollById(enrollId);
        if (!enroll) {
            return { error: "Enrollment not found" };
        }

        // Get the class and verify the teacher owns it
        const classData = await Class.findById(enroll.class_id);
        if (!classData) {
            return { error: "Class not found" };
        }

        if (classData.teacher_id.toString() !== teacherId) {
            return { error: "Only the teacher of this class can mark enrollment as completed" };
        }

        const updatedEnroll = await EnrollRepo.updateEnrollStatusById(enrollId, "completed");
        return updatedEnroll;
    }

    async getStudentEnrollments(studentId: string) {
        return await EnrollRepo.getEnrollsByStudentId(studentId);
    }

    async removeEnrollment(userId: string, classId: string) {
        return await EnrollRepo.deleteEnroll(userId, classId);
    }

    async getAdminEnrollmentStats(timeRange: string = '30days', status: string = 'all') {
        const validTimeRanges = ['7days', '30days', '3months', '1year', 'all'];
        const validStatuses = ['in_progress', 'completed', 'all'];
        
        if (!validTimeRanges.includes(timeRange)) {
            return { error: "Invalid timeRange parameter. Must be one of: 7days, 30days, 3months, 1year, all" };
        }
        if (!validStatuses.includes(status)) {
            return { error: "Invalid status parameter. Must be one of: in_progress, completed, all" };
        }

        const stats = await EnrollRepo.getAdminEnrollmentStats(timeRange, status);
        
        // Format byStatus data
        const byStatus: any = {};
        if (stats.byStatus) {
            stats.byStatus.forEach((item: any) => {
                byStatus[item._id] = item.count;
            });
        }

        // Format trend data
        const trend = stats.trend || [];
        const trendData = trend.map((item: any) => ({
            date: item._id,
            count: item.count
        }));

        // Calculate total
        const totalEnrollments = stats.total && stats.total[0] ? stats.total[0].count : 0;

        // Calculate completion rate
        const completedCount = byStatus.completed || 0;
        const completionRate = totalEnrollments > 0 
            ? Math.round((completedCount / totalEnrollments) * 1000) / 10 
            : 0;

        // Calculate average completion days
        const avgCompletionDays = stats.completionData && stats.completionData[0]
            ? Math.round(stats.completionData[0].avgDays)
            : 0;

        return {
            timeRange,
            status,
            totalEnrollments,
            byStatus,
            completionRate,
            averageCompletionDays: avgCompletionDays,
            trend: trendData
        };
    }
}

export default new EnrollService();