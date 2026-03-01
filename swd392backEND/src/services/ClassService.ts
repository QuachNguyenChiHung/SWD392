import ClassRepo from "../repository/ClassRepo.ts";
import { Teacher } from "../entities/Teacher.ts";
import type { CreateClassDTO, UpdateClassDTO } from "../dto/ClassDTO.ts";
import { User } from "../entities/User.ts";
import generateRandomString from "../ultis/misc.ts";

class ClassService {
    async getClassById(id: string) {
        return await ClassRepo.getClassById(id);
    }
    async getClassesByTeacher(teacherId: string, page: number) {
        return await ClassRepo.getClassesByTeacher(teacherId, page);
    }
    async getClassesByStudent(studentId: string, page: number) {
        return await ClassRepo.getClassesByStudent(studentId, page);
    }
    async createClass(classData: CreateClassDTO) {
        return await ClassRepo.createClass(classData);
    }
    async updateClass(id: string, updateData: UpdateClassDTO, teacherUserId: string) {
        const classObj = await ClassRepo.getClassById(id);
        if (!classObj) {
            return null;
        }
        const teacher = await User.findById(classObj.teacher_id);
        if (!teacher || teacher._id.toString() !== teacherUserId) {
            return { error: "You can only update your own class" };
        }
        return await ClassRepo.updateClass(id, updateData);
    }
    async generateKeypass(classId: string) {
        const keypass=generateRandomString();
        const teacherClass=await this.getClassById(classId);
        if(!teacherClass){
            return { error: "Class not found" };
        }
        teacherClass.keypass=keypass;
        await teacherClass?.save();
        return keypass;
    }
    async deleteClass(id: string) {
        return await ClassRepo.deleteClass(id);
    }
    async toggleStatus(id: string) {
        return await ClassRepo.toggleStatus(id);
    }
    async getClassCountByTeacher(teacherId: string) {
        return await ClassRepo.getClassCountByTeacher(teacherId);
    }
    async searchClassesByName(name: string, page: number) {
        return await ClassRepo.searchClassesByName(name, page);
    }
    async searchClassesByNameFromTeacher(teacherId: string, name: string, page: number) {
        return await ClassRepo.searchClassesByNameFromTeacher(teacherId, name, page);
    }
    async verifyImageOwnership(url: string, teacherUserId: string) {
        const classObj = await ClassRepo.findByImageUrl(url);
        if (!classObj) {
            return { error: "No class found with this image" };
        }
        const teacher = await User.findById(classObj.teacher_id);
        if (!teacher || teacher._id.toString() !== teacherUserId) {
            return { error: "You can only modify images of your own class" };
        }
        return null;
    }
    async updateClassImage(oldUrl: string, newUrl: string, teacherUserId: string) {
        const classObj = await ClassRepo.findByImageUrl(oldUrl);
        if (!classObj) return { error: 'No class found with this image' };
        const teacher = await User.findById(classObj.teacher_id);
        if (!teacher || teacher._id.toString() !== teacherUserId) return { error: 'You can only modify images of your own class' };
        return await ClassRepo.updateClass(classObj._id.toString(), { img_cover_link: newUrl });
    }
    async clearClassImage(oldUrl: string, teacherUserId: string) {
        const classObj = await ClassRepo.findByImageUrl(oldUrl);
        if (!classObj) return { error: 'No class found with this image' };
            const teacher = await User.findById(classObj.teacher_id);
            if (!teacher || teacher._id.toString() !== teacherUserId) return { error: 'You can only modify images of your own class' };
        return await ClassRepo.updateClass(classObj._id.toString(), { img_cover_link: null });
    }
}
export default new ClassService;