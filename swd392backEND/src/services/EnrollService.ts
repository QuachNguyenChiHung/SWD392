import EnrollRepo from "../repository/EnrollRepo.ts";
import { Class } from "../entities/Class.ts";
import { Teacher } from "../entities/Teacher.ts";
import type { CreateEnrollDTO } from "../dto/EnrollDTO.ts";

class EnrollService {
    async createEnrollment(enrollData: CreateEnrollDTO) {
        try {
            // Validate keypass with class
            const classData = await Class.findById(enrollData.class_id);
            if (!classData) {
                return { error: "Class not found" };
            }

            if (classData.keypass !== enrollData.keypass) {
                return { error: "Invalid keypass for this class" };
            }

            // Check if already enrolled
            const existingEnroll = await EnrollRepo.findEnrollByUserAndClass(
                enrollData.student_id,
                enrollData.class_id
            );

            if (existingEnroll) {
                return { error: "Student already enrolled in this class" };
            }

            const newEnroll = await EnrollRepo.createEnroll(enrollData);
            return newEnroll;
        } catch (error) {
            return { error: `Error creating enrollment: ${error}` };
        }
    }

    async getEnrollmentsByClass(classId: string, page: number = 1) {
        return await EnrollRepo.getEnrollsByClassId(classId, page);
    }

    async completeEnrollment(enrollId: string, teacherUserId: string) {
        try {
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

            const teacher = await Teacher.findById(classData.teacher_id);
            if (!teacher || teacher.user_id.toString() !== teacherUserId) {
                return { error: "Only the teacher of this class can mark enrollment as completed" };
            }

            const updatedEnroll = await EnrollRepo.updateEnrollStatusById(enrollId, "completed");
            return updatedEnroll;
        } catch (error) {
            return { error: `Error completing enrollment: ${error}` };
        }
    }

    async getStudentEnrollments(studentId: string) {
        return await EnrollRepo.getEnrollsByStudentId(studentId);
    }

    async removeEnrollment(userId: string, classId: string) {
        return await EnrollRepo.deleteEnroll(userId, classId);
    }
}

export default new EnrollService();