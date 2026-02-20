
import { Class } from "../entities/Class.ts";
import { Enroll } from "../entities/Enroll.ts";


class ClassRepo {
    async getClassById(id: string) {
        return await Class.findById(id);
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
    async createClass(classData: any) {
        const newClass = new Class(classData);
        return await newClass.save();
    }
    async updateClass(id: string, updateData: any) {
        return await Class.findByIdAndUpdate(id, updateData, { new: true });
    }
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
}
export default new ClassRepo;