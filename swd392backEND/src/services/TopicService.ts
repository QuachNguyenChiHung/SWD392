import TopicRepo from "../repository/TopicRepo.ts";
import CourseRepo from "../repository/CourseRepo.ts";
import type { TopicCreateDTO, TopicUpdateDTO, TopicSearchDTO } from "../dto/TopicDTO.ts";
import mongoose from "mongoose";
import { ClassMaterial } from "../entities/ClassMaterial.ts";
import { ProgressClassMaterial } from "../entities/ProgressClassMaterial.ts";
import ContentDeletionHelper from "../ultis/ContentDeletionHelper.ts";

class TopicService {
    async getTopicById(topicId: string) {
        return await TopicRepo.getTopicById(topicId);
    }

    async createTopic(topicData: TopicCreateDTO) {
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
    }

    async updateTopic(topicId: string, updateData: TopicUpdateDTO) {
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
    }

    async deleteTopic(topicId: string) {
        return await TopicRepo.deleteTopic(topicId);
    }

    /**
     * Cascade delete a topic and all related entities using atomic transaction.
     * 
     * This method performs a complete cascade deletion of a topic and all its
     * associated data. All deletions occur within a MongoDB transaction to ensure
     * atomicity - either all entities are deleted or none are (rollback on failure).
     * 
     * Returns structured results following no-throwing pattern:
     * - Never throws exceptions for expected conditions (not found)
     * - Returns structured objects with success/error indicators
     * - Provides detailed deletion counts on success
     * 
     * Deletion order (maintains referential integrity):
     * 1. Content entities (Quiz/File/Slide/Render2D/AiContent/AiRequest) via ContentDeletionHelper
     * 2. Feedback (via ClassMaterial)
     * 3. ProgressClassMaterial (via ClassMaterial)
     * 4. ClassMaterial
     * 5. Topic
     * 
     * @param {string} topicId - MongoDB ObjectId of the topic to delete
     * 
     * @returns {Promise<Object>} Structured result object
     * 
     * @returns {Object} Success response
     * @returns {boolean} success - true
     * @returns {string} message - "Topic deleted successfully"
     * @returns {Object} deletedCounts - Breakdown of deleted entities by type
     * @returns {number} deletedCounts.topics - Topics deleted (always 1)
     * @returns {number} deletedCounts.classMaterials - Class materials deleted
     * @returns {number} deletedCounts.progressClassMaterial - Progress records deleted
     * @returns {number} deletedCounts.feedback - Feedback records deleted
     * @returns {number} deletedCounts.quizzes - Quizzes deleted
     * @returns {number} deletedCounts.questions - Questions deleted
     * @returns {number} deletedCounts.quizAttempts - Quiz attempts deleted
     * @returns {number} deletedCounts.results - Result records deleted
     * @returns {number} deletedCounts.files - File entities deleted
     * @returns {number} deletedCounts.slides - Slides deleted
     * @returns {number} deletedCounts.render2d - Render2D objects deleted
     * @returns {number} deletedCounts.aiContents - AI content records deleted
     * @returns {number} deletedCounts.aiRequests - AI request records deleted
     * 
     * @returns {Object} Error response (not found)
     * @returns {boolean} success - false
     * @returns {string} error - "Topic not found"
     * @returns {null} result - null
     * 
     * @returns {Object} Error response (transaction failed)
     * @returns {boolean} success - false
     * @returns {string} error - "delete_failed"
     * @returns {Object} details - Error details
     * @returns {string} details.message - Error message from transaction
     * 
     * @example
     * const result = await TopicService.deleteTopicCascade(topicId);
     * if (result.success) {
     *   console.log(`Deleted ${result.deletedCounts.classMaterials} materials`);
     *   console.log(`Deleted ${result.deletedCounts.aiContents} AI contents`);
     * }
     * 
     * @throws Never throws - returns structured error objects instead
     * 
     * @notes
     * - Uses Mongoose session-based transaction
     * - Automatically rolls back on any failure
     * - Logs errors to console for debugging
     * - Uses ContentDeletionHelper for reusable content deletion logic
     * - External file cleanup (S3/Cloudinary) may need separate handling
     */
    async deleteTopicCascade(topicId: string) {
        const session = await mongoose.startSession();

        try {
            // Check if topic exists
            const topic = await TopicRepo.getTopicById(topicId);
            if (!topic) {
                return {
                    success: false,
                    error: "Topic not found",
                    result: null
                };
            }

            await session.startTransaction();

            const deletedCounts: any = {
                topics: 0,
                classMaterials: 0,
                progressClassMaterial: 0,
                feedback: 0,
                quizzes: 0,
                questions: 0,
                quizAttempts: 0,
                results: 0,
                files: 0,
                slides: 0,
                render2d: 0,
                aiContents: 0,
                aiRequests: 0
            };

            // Step 1: Get all ClassMaterials for this topic
            const classMaterials = await ClassMaterial.find({
                topic_id: topicId
            }).session(session);

            // Step 2: Delete content and related data for each ClassMaterial
            for (const material of classMaterials) {
                // Use ContentDeletionHelper for cascade deletion of content and AI entities
                const counts = await ContentDeletionHelper.deleteContentByMaterial(material, session);
                ContentDeletionHelper.addCounts(deletedCounts, counts);
            }

            // Step 3: Delete ProgressClassMaterial for all materials
            const progressDeleted = await ProgressClassMaterial.deleteMany({
                material_id: { $in: classMaterials.map(m => m._id) }
            }).session(session);
            deletedCounts.progressClassMaterial += progressDeleted.deletedCount || 0;

            // Step 4: Delete all class materials
            const materialsDeleted = await ClassMaterial.deleteMany({
                topic_id: topicId
            }).session(session);
            deletedCounts.classMaterials += materialsDeleted.deletedCount || 0;

            // Step 5: Delete the topic itself
            const topicDeleted = await TopicRepo.deleteTopicWithSession(topicId, session);
            deletedCounts.topics = topicDeleted ? 1 : 0;

            await session.commitTransaction();

            return {
                success: true,
                message: "Topic deleted successfully",
                deletedCounts
            };

        } catch (error: any) {
            await session.abortTransaction();
            console.error("Error in deleteTopicCascade:", error);

            return {
                success: false,
                error: "delete_failed",
                details: {
                    message: error.message || "Transaction failed"
                }
            };
        } finally {
            session.endSession();
        }
    }

    async getAllTopics(page: number = 1) {
        return await TopicRepo.getAllTopics(page);
    }

    async getTopicsByCourse(courseId: string, page: number = 1) {
        // Validate that the course exists
        const course = await CourseRepo.getCourseById(courseId);
        if (!course) {
            return { error: "Course not found" };
        }

        // Get topics for the course with pagination
        const topics = await TopicRepo.getTopicsByCourseIdWithPagination(courseId, page);

        const courseObj = { ...course.toObject(), topics };
        return courseObj;
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
    }
}

export default new TopicService();