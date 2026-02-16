import CourseRepo from "../repository/CourseRepo.ts";
import type { CourseCreateDTO, CourseUpdateDTO } from "../dto/CourseDTO.ts";
import TopicService from "./TopicService.ts";

class CourseService {
    async getCourseById(courseId: string) {
        return await CourseRepo.getCourseById(courseId);
    }

    async createCourse(courseData: CourseCreateDTO) {
        return await CourseRepo.createCourse(courseData);
    }

    async updateCourse(courseId: string, updateData: CourseUpdateDTO) {
        try {
            // If updating course name, check if it already exists
            if (updateData.course_name) {
                const existingCourse = await CourseRepo.findByCourseName(updateData.course_name);
                if (existingCourse && existingCourse._id.toString() !== courseId) {
                    return { error: "Course name already exists" };
                }
            }

            const updatedCourse = await CourseRepo.updateCourse(courseId, updateData);
            return updatedCourse;
        } catch (error) {
            throw new Error(`Error updating course: ${error}`);
        }
    }

    async deleteCourse(courseId: string) {
        try {
            // You might want to add validation here to prevent deletion if course has topics
            await TopicService.deleteTopicsByCourse(courseId);
            return await CourseRepo.deleteCourse(courseId);
        } catch (error) {
            throw new Error(`Error deleting course: ${error}`);
        }
    }

    async getAllCourses(page: number = 1) {
        try {
            const courses = await CourseRepo.getAllCourses(page);
            return courses || [];
        } catch (error) {
            throw new Error(`Error retrieving courses: ${error}`);
        }
    }

    async toggleCourseStatus(courseId: string) {
        return await CourseRepo.toggleStatus(courseId);
    }

    async searchCoursesByKeyword(keyword: string, page: number) {
        return await CourseRepo.findByKeyword(keyword, page);
    }

    async searchCoursesByGradeLevel(gradeLevel: number) {
        return await CourseRepo.getCoursesByGradeLevel(gradeLevel);
    }

    async findByCourseName(courseName: string) {
        return await CourseRepo.findByCourseName(courseName);
    }

    async getActiveCourses() {
        return await CourseRepo.getActiveCourses();
    }

    async getCoursesByGradeLevel(gradeLevel: number) {
        return await CourseRepo.getCoursesByGradeLevel(gradeLevel);
    }

    async getCoursesStatistics() {
        try {
            const totalCourses = await CourseRepo.getTotalCoursesCount();
            const activeCourses = await CourseRepo.getActiveCourses();

            return {
                totalCourses,
                activeCourses: activeCourses.length,
                inactiveCourses: totalCourses - activeCourses.length
            };
        } catch (error) {
            throw new Error(`Error retrieving course statistics: ${error}`);
        }
    }
}

export default new CourseService();