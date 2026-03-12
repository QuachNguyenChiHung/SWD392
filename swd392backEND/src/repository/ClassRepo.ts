
import { Class } from "../entities/Class.ts";
import { Enroll } from "../entities/Enroll.ts";
import { User } from "../entities/User.ts";


class ClassRepo {
    async getClassById(id: string) {
        return await Class.findById(id);
    }
    async getClassByKeypass(keypass: string) {
        return await Class.findOne({ keypass });
    }
    async searchClassesByName(name: string, page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await Class.find({ class_name: { $regex: name, $options: 'i' } }).skip(skip).limit(limit);
    }
    async searchClassesByNameFromTeacher(teacherId: string, name: string, page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await Class.find({ teacher_id: teacherId, class_name: { $regex: name, $options: 'i' } }).skip(skip).limit(limit);
    }
    async getClassesByTeacher(teacherId: string, page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await Class.find({ teacher_id: teacherId }).skip(skip).limit(limit);
    }
    async getClassesByStudent(studentId: string, page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        const enrolledClassesId = await Enroll.find({ student_id: studentId }).distinct('class_id');
        return await Class.find({ _id: { $in: enrolledClassesId } }).skip(skip).limit(limit);
    }
    async getStudentsByClass(classId: string, page: number, keyword: string) {
        const limit = 12;
        const skip = (page - 1) * limit;
        const enrolledStudentsId = await Enroll.find({ class_id: classId }).distinct('student_id');

        return await User.find({
            _id: { $in: enrolledStudentsId },
            $or: [
                { username: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } }
            ]
        })
            .skip(skip).limit(limit);
    }
    async createClass(classData: any) {
        const newClass = new Class(classData);
        return await newClass.save();
    }

    async updateClass(id: string, updateData: any) {
        return await Class.findByIdAndUpdate(id, updateData, { new: true });
    }
    /**
     * Delete a class by ID (simple deletion without cascade).
     * 
     * Note: This method performs a simple delete of the Class document only.
     * For cascade deletion of all related entities, use ClassService.deleteClassCascade().
     * 
     * @param {string} id - MongoDB ObjectId of the class to delete
     * @returns {Promise<IClass | null>} Deleted class document or null if not found
     * 
     * @deprecated Consider using ClassService.deleteClassCascade() for production
     *             to ensure all related entities are properly cleaned up.
     */
    async deleteClass(id: string) {
        return await Class.findByIdAndDelete(id);
    }
    async toggleStatus(id: string) {
        const classObj = await Class.findById(id);
        if (classObj) {
            classObj.status = (classObj.status == "active") ? "inactive" : "active";
            return await classObj.save();
        }
        return null;
    }
    async getClassCountByTeacher(teacherId: string) {
        return await Class.countDocuments({ teacher_id: teacherId });
    }
    async findByImageUrl(url: string) {
        return await Class.findOne({ img_cover_link: url });
    }

    async getAdminClassStats(timeRange: string, status: string) {
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

        if (dateFilter) matchStage.date_create = { $gte: dateFilter };
        if (status !== 'all') matchStage.status = status;

        const [stats] = await Class.aggregate([
            { $match: matchStage },
            {
                $facet: {
                    byStatus: [
                        { $group: { _id: "$status", count: { $sum: 1 } } }
                    ],
                    trend: [
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date_create" } },
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],
                    total: [{ $count: "count" }],
                    classIds: [
                        { $project: { _id: 1, class_name: 1 } }
                    ]
                }
            }
        ]);

        // Get top enrolled classes
        const topEnrolled = await Enroll.aggregate([
            {
                $group: {
                    _id: "$class_id",
                    enrollments: { $sum: 1 }
                }
            },
            { $sort: { enrollments: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "classes",
                    localField: "_id",
                    foreignField: "_id",
                    as: "classInfo"
                }
            },
            { $unwind: "$classInfo" },
            {
                $project: {
                    classId: "$_id",
                    className: "$classInfo.class_name",
                    enrollments: 1,
                    _id: 0
                }
            }
        ]);

        // Calculate average class size
        const classEnrollmentStats = await Enroll.aggregate([
            {
                $group: {
                    _id: "$class_id",
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    avgSize: { $avg: "$count" },
                    totalClasses: { $sum: 1 }
                }
            }
        ]);

        const avgClassSize = classEnrollmentStats[0]?.avgSize || 0;

        return { ...stats, topEnrolled, avgClassSize };
    }
}
export default new ClassRepo;