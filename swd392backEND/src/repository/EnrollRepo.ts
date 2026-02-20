import { Enroll } from "../entities/Enroll.ts";
import type { IEnroll } from "../interface/IEnroll.ts";
import type { CreateEnrollDTO } from "../dto/EnrollDTO.ts";

class EnrollRepo {
    async getEnrollById(enrollId: string) {
        return await Enroll.findById(enrollId);
    }

    async createEnroll(enrollData: CreateEnrollDTO) {
        const enroll = new Enroll({
            class_id: enrollData.class_id,
            student_id: enrollData.student_id
        });
        return await enroll.save();
    }

    async getEnrollsByClassId(classId: string, page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await Enroll.find({ class_id: classId })
            .populate('student_id', 'username email')
            .populate('class_id', 'class_name')
            .skip(skip)
            .limit(limit);
    }

    async updateEnrollStatusById(enrollId: string, status: "in_progress" | "completed") {
        const updateData: any = { status };
        if (status === "completed") {
            updateData.date_end = new Date();
        }

        return await Enroll.findByIdAndUpdate(
            enrollId,
            updateData,
            { new: true }
        );
    }

    async findEnrollByUserAndClass(userId: string, classId: string) {
        return await Enroll.findOne({
            student_id: userId,
            class_id: classId
        });
    }

    async getEnrollsByStudentId(studentId: string) {
        return await Enroll.find({ student_id: studentId })
            .populate('class_id', 'class_name');
    }

    async deleteEnroll(userId: string, classId: string) {
        return await Enroll.findOneAndDelete({
            student_id: userId,
            class_id: classId
        });
    }
}

export default new EnrollRepo();