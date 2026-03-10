import ProgressClassMaterialRepo from "../repository/ProgressClassMaterialRepo.ts";
import EnrollRepo from "../repository/EnrollRepo.ts";

import ClassMaterialRepo from "../repository/ClassMaterialRepo.ts";

class ProgressClassMaterialService {
    async getProgressByEnroll(enrollId: string) {
        return await ProgressClassMaterialRepo.getByEnrollId(enrollId);
    }

    async getProgressByMaterial(classMaterialId: string) {
        return await ProgressClassMaterialRepo.getByClassMaterialId(classMaterialId);
    }

    async getProgressByEnrollAndMaterial(enrollId: string, classMaterialId: string) {
        return await ProgressClassMaterialRepo.getByEnrollAndMaterial(enrollId, classMaterialId);
    }

    async createProgress(enrollId: string, classMaterialId: string) {
        const enroll = await EnrollRepo.getEnrollById(enrollId);
        if (!enroll) {
            return { error: "Enrollment not found" };
        }

        const existing = await ProgressClassMaterialRepo.getByEnrollAndMaterial(enrollId, classMaterialId);
        if (existing) {
            return { error: "Progress record already exists" };
        }

        return await ProgressClassMaterialRepo.create({
            enroll_id: enrollId,
            classmaterial_id: classMaterialId,
        });
    }

    async createProgressByClassAndStudent(classId: string, studentId: string, classMaterialId: string) {
        const enroll = await EnrollRepo.findEnrollByUserAndClass(studentId, classId);
        if (!enroll) {
            return { error: "Enrollment not found for this student and class" };
        }

        const enrollId = enroll._id as string;
        const existing = await ProgressClassMaterialRepo.getByEnrollAndMaterial(enrollId.toString(), classMaterialId);
        if (existing) {
            return { error: "Progress record already exists" };
        }

        return await ProgressClassMaterialRepo.create({
            enroll_id: enrollId,
            classmaterial_id: classMaterialId,
        });
    }

    async markAsCompleted(enrollId: string, classMaterialId: string) {
        const progress = await ProgressClassMaterialRepo.getByEnrollAndMaterial(enrollId, classMaterialId);
        if (!progress) {
            return { error: "Progress record not found" };
        }

        return await ProgressClassMaterialRepo.updateCompletionStatus(progress._id as string, "completed");
    }

    async markAsCompletedByClassAndStudent(classId: string, studentId: string, classMaterialId: string) {
        const enroll = await EnrollRepo.findEnrollByUserAndClass(studentId, classId);
        if (!enroll) {
            return { error: "Enrollment not found for this student and class" };
        }

        return await this.markAsCompleted(enroll._id.toString(), classMaterialId);
    }

    async getProgressByClassAndStudent(classId: string, studentId: string) {
        const enroll = await EnrollRepo.findEnrollByUserAndClass(studentId, classId);
        if (!enroll) {
            return { error: "Enrollment not found for this student and class" };
        }

        const enrollId = enroll._id.toString();
        const totalMaterials = await ClassMaterialRepo.getActiveClassMaterialCount(classId);
        const progressRecords = await ProgressClassMaterialRepo.getByEnrollId(enrollId);
        const completed = progressRecords.filter((p: any) => p.completion_status === "completed").length;

        return {
            total: totalMaterials,
            completed,
            not_completed: totalMaterials - completed,
            progress: progressRecords,
        };
    }

    async getClassProgressForAllStudents(classId: string) {
        const enrollments = await EnrollRepo.getAllEnrollsByClassId(classId);
        const totalMaterials = await ClassMaterialRepo.getActiveClassMaterialCount(classId);

        const studentsProgress = await Promise.all(
            enrollments.map(async (enroll: any) => {
                const progressRecords = await ProgressClassMaterialRepo.getByEnrollId(enroll._id.toString());
                const completed = progressRecords.filter((p: any) => p.completion_status === "completed").length;

                return {
                    enroll_id: enroll._id,
                    student: enroll.student_id,
                    status: enroll.status,
                    total: totalMaterials,
                    completed,
                    not_completed: totalMaterials - completed,
                };
            })
        );

        return { total_materials: totalMaterials, students: studentsProgress };
    }

    // Eager: called after a new enrollment is created
    async bulkCreateForEnrollment(enrollId: string, classId: string) {
        const activeMaterials = await ClassMaterialRepo.getActiveClassMaterialsByClass(classId);
        await Promise.all(
            activeMaterials.map((m: any) =>
                ProgressClassMaterialRepo.create({
                    enroll_id: enrollId,
                    classmaterial_id: m._id.toString(),
                })
            )
        );
    }

    // Eager: called after a material is published/reviewed
    async bulkCreateForMaterial(classMaterialId: string, classId: string) {
        const enrollments = await EnrollRepo.getAllEnrollsByClassId(classId);
        await Promise.all(
            enrollments.map((e: any) =>
                ProgressClassMaterialRepo.create({
                    enroll_id: e._id.toString(),
                    classmaterial_id: classMaterialId,
                })
            )
        );
    }

    // Eager: called when a material is set to draft/deleted
    async bulkDeleteForMaterial(classMaterialId: string) {
        await ProgressClassMaterialRepo.deleteByClassMaterialId(classMaterialId);
    }

    async markAsInProgress(id: string) {
        const progress = await ProgressClassMaterialRepo.getById(id);
        if (!progress) {
            return { error: "Progress record not found" };
        }

        return await ProgressClassMaterialRepo.updateCompletionStatus(id, "in_progress");
    }

    async deleteProgress(id: string) {
        return await ProgressClassMaterialRepo.deleteById(id);
    }

    async deleteProgressByEnroll(enrollId: string) {
        return await ProgressClassMaterialRepo.deleteByEnrollId(enrollId);
    }


}

export default new ProgressClassMaterialService();
