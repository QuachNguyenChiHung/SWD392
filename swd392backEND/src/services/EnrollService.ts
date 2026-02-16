import EnrollRepo from "../repository/EnrollRepo.ts";
import { Class } from "../entities/Class.ts";
import type { CreateEnrollDTO } from "../dto/EnrollDTO.ts";
import { Types } from "mongoose";

class EnrollService {
    async createEnrollment(enrollData: CreateEnrollDTO) {
        try {
            // Validate keypass with class
            const classData = await Class.findById(new Types.ObjectId(enrollData.class_id));
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
            throw new Error(`Error creating enrollment: ${error}`);
        }
    }

    async getEnrollmentsByClass(classId: string, page: number = 1) {
        return await EnrollRepo.getEnrollsByClassId(classId, page);
    }

    async completeEnrollment(enrollId: string) {
        try {
            const updatedEnroll = await EnrollRepo.updateEnrollStatusById(enrollId, "completed");
            if (!updatedEnroll) {
                return { error: "Enrollment not found" };
            }
            return updatedEnroll;
        } catch (error) {
            throw new Error(`Error completing enrollment: ${error}`);
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