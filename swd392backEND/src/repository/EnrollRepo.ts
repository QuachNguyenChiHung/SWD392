import { Enroll } from "../entities/Enroll.ts";
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

    async getAllEnrollsByClassId(classId: string) {
        return await Enroll.find({ class_id: classId })
            .populate('student_id', 'username email');
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

    async getAdminEnrollmentStats(timeRange: string, status: string) {
        const getDateFilter = (range: string) => {
            const now = new Date();
            switch (range) {
                case '7days': return new Date(now.setDate(now.getDate() - 7));
                case '30days': return new Date(now.setDate(now.getDate() - 30));
                case '3months': return new Date(now.setMonth(now.getMonth() - 3));
                case '1year': return new Date(now.setFullYear(now.getFullYear() - 1));
                default: return null;
            }
        };

        const dateFilter = getDateFilter(timeRange);
        const matchStage: any = {};

        if (dateFilter) matchStage.enrollment_date = { $gte: dateFilter };
        if (status !== 'all') matchStage.status = status;

        const [stats] = await Enroll.aggregate([
            { $match: matchStage },
            {
                $facet: {
                    byStatus: [
                        { $group: { _id: "$status", count: { $sum: 1 } } }
                    ],
                    trend: [
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m-%d", date: "$enrollment_date" } },
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],
                    total: [{ $count: "count" }],
                    completionData: [
                        {
                            $match: {
                                status: "completed",
                                date_end: { $ne: null }
                            }
                        },
                        {
                            $project: {
                                daysToComplete: {
                                    $divide: [
                                        { $subtract: ["$date_end", "$enrollment_date"] },
                                        1000 * 60 * 60 * 24
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                avgDays: { $avg: "$daysToComplete" },
                                count: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ]);

        return stats;
    }
}

export default new EnrollRepo();