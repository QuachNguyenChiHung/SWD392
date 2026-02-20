import TopicRepo from "../repository/TopicRepo.ts";
import CourseRepo from "../repository/CourseRepo.ts";
import type { TopicCreateDTO, TopicUpdateDTO, TopicSearchDTO } from "../dto/TopicDTO.ts";

class TopicService {
    async getTopicById(topicId: string) {
        return await TopicRepo.getTopicById(topicId);
    }

    async createTopic(topicData: TopicCreateDTO) {
        try {
            // Validate that the course exists
            const course = await CourseRepo.getCourseById(topicData.course_id);
            if (!course) {
                return { error: "Course not found" };
            }

            // Check if topic with same title already exists for this course
            const existingTopic = await TopicRepo.findByTitle(topicData.title);
            if (existingTopic && existingTopic.course_id.toString() === topicData.course_id) {
                return { error: "Topic with this title already exists in the course" };
            }

            const newTopic = await TopicRepo.createTopic(topicData);
            return newTopic;
        } catch (error) {
            return { error: `Error creating topic: ${error}` };
        }
    }

    async updateTopic(topicId: string, updateData: TopicUpdateDTO) {
        try {
            // If updating course_id, validate that the course exists
            if (updateData.course_id) {
                const course = await CourseRepo.getCourseById(updateData.course_id);
                if (!course) {
                    return { error: "Course not found" };
                }
            }

            // If updating title, check if it already exists in the same course
            if (updateData.title) {
                const existingTopic = await TopicRepo.findByTitle(updateData.title);
                if (existingTopic && existingTopic._id.toString() !== topicId) {
                    const currentTopic = await TopicRepo.getTopicById(topicId);
                    const targetCourseId = updateData.course_id || currentTopic?.course_id.toString();

                    if (existingTopic.course_id.toString() === targetCourseId) {
                        return { error: "Topic with this title already exists in the course" };
                    }
                }
            }

            const updatedTopic = await TopicRepo.updateTopic(topicId, updateData);
            return updatedTopic;
        } catch (error) {
            return { error: `Error updating topic: ${error}` };
        }
    }

    async deleteTopic(topicId: string) {
        return await TopicRepo.deleteTopic(topicId);
    }

    async getAllTopics(page: number = 1) {
        return await TopicRepo.getAllTopics(page);
    }

    async getTopicsByCourse(courseId: string, page: number = 1) {
        return await TopicRepo.getTopicsByCourseIdWithPagination(courseId, page);
    }

    async searchTopicsByCourseId(courseId: string) {
        return await TopicRepo.getTopicsByCourseId(courseId);
    }

    async searchTopicsByKeyword(keyword: string, page: number) {
        return await TopicRepo.findByKeyword(keyword, page);
    }


    async deleteTopicsByCourse(courseId: string) {
        return await TopicRepo.deleteTopicsByCourseId(courseId);
    }

    async getTopicStatistics() {
        return await TopicRepo.getTotalTopicsCount();
    }

    async getTopicStatisticsByCourse(courseId: string) {
        try {
            // Validate that the course exists
            const course = await CourseRepo.getCourseById(courseId);
            if (!course) {
                return { error: "Course not found" };
            }

            const topicsCount = await TopicRepo.getTopicsCountByCourse(courseId);

            return {
                courseId,
                courseName: course.course_name,
                topicsCount
            };
        } catch (error) {
            return { error: `Error retrieving topic statistics by course: ${error}` };
        }
    }
}

export default new TopicService();