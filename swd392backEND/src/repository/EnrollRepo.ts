import { Enroll } from "../entities/Enroll.ts";
import type { IEnroll } from "../interface/IEnroll.ts";
import type { CreateEnrollDTO } from "../dto/EnrollDTO.ts";
import { Types } from "mongoose";

class EnrollRepo {
    async createEnroll(enrollData: CreateEnrollDTO) {
        const enroll = new Enroll({
            class_id: new Types.ObjectId(enrollData.class_id),
            student_id: new Types.ObjectId(enrollData.student_id)
        });
        return await enroll.save();
    }

    async getEnrollsByClassId(classId: string, page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await Enroll.find({ class_id: new Types.ObjectId(classId) })
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
            new Types.ObjectId(enrollId),
            updateData,
            { new: true }
        );
    }

    async findEnrollByUserAndClass(userId: string, classId: string) {
        return await Enroll.findOne({
            student_id: new Types.ObjectId(userId),
            class_id: new Types.ObjectId(classId)
        });
    }

    async getEnrollsByStudentId(studentId: string) {
        return await Enroll.find({ student_id: new Types.ObjectId(studentId) })
            .populate('class_id', 'class_name');
    }

    async deleteEnroll(userId: string, classId: string) {
        return await Enroll.findOneAndDelete({
            student_id: new Types.ObjectId(userId),
            class_id: new Types.ObjectId(classId)
        });
    }
}

export default new EnrollRepo();