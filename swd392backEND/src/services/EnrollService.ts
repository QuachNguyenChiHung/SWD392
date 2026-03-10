import EnrollRepo from "../repository/EnrollRepo.ts";
import { Class } from "../entities/Class.ts";
import type { CreateEnrollDTO, EnrollByKeypassDTO, InviteStudentDTO } from "../dto/EnrollDTO.ts";
import ProgressClassMaterialService from "./ProgressClassMaterialService.ts";

class EnrollService {
    async createEnrollment(enrollData: CreateEnrollDTO) {
        // Validate keypass with class
        if (enrollData.class_id) {
            const classData = await Class.findById(enrollData.class_id);
            if (!classData) {
                return { error: "Class not found" };
            }
        }

        if (enrollData.keypass) {
            const classData = await Class.getClassByKeypass(enrollData.keypass);
            if (!classData) {
                return { error: "Class not found" };
            }
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
}

export default new EnrollService();