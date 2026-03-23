import { Course } from "../entities/Course.ts";
import type { CourseCreateDTO, CourseUpdateDTO } from "../dto/CourseDTO.ts";

class CourseRepo {
    async getAllCourses(page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await Course.find().skip(skip).limit(limit);
    }

    async getCourseById(id: string) {
        return await Course.findById(id);
    }

    async createCourse(courseData: CourseCreateDTO) {
        const course = new Course(courseData);
        return await course.save();
    }

    async updateCourse(id: string, updateData: CourseUpdateDTO) {
        return await Course.findByIdAndUpdate(id, updateData, { new: true });
    }

    async deleteCourse(id: string) {
        return await Course.findByIdAndDelete(id);
    }

    async toggleStatus(id: string) {
        const course = await Course.findById(id);
        if (course) {
            course.status = course.status === "active" ? "inactive" : "active";
            return await course.save();
        }
        return null;
    }

    async findByCourseName(courseName: string) {
        return await Course.findOne({ course_name: courseName });
    }

    async findByKeyword(keyword: string, page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await Course.find({
            course_name: { $regex: keyword, $options: 'i' }
        }).skip(skip).limit(limit);
    }

    async getCoursesByGradeLevel(gradeLevel: number) {
        return await Course.find({ grade_level: gradeLevel });
    }

    async getActiveCourses() {
        return await Course.find({ status: "active" });
    }

    async getTotalCoursesCount() {
        return await Course.countDocuments();
    }
}

export default new CourseRepo();