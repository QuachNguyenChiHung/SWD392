import ClassRepo from "../repository/ClassRepo.ts";
import type { CreateClassDTO, UpdateClassDTO } from "../dto/ClassDTO.ts";
import generateRandomString from "../ultis/misc.ts";
import mongoose from "mongoose";
import { ClassMaterial } from "../entities/ClassMaterial.ts";
import { Enroll } from "../entities/Enroll.ts";
import { Feedback } from "../entities/Feedback.ts";
import { File } from "../entities/File.ts";
import { ProgressClassMaterial } from "../entities/ProgressClassMaterial.ts";
import { Question } from "../entities/Question.ts";
import { Quiz } from "../entities/Quiz.ts";
import { QuizAttempt } from "../entities/QuizAttempt.ts";
import { Render2D } from "../entities/Render2D.ts";
import { Result } from "../entities/Result.ts";
import { Slide } from "../entities/Slide.ts";
import { AiContent } from "../entities/AiContent.ts";
import { AiRequest } from "../entities/AiRequest.ts";
import ContentDeletionHelper from "../ultis/ContentDeletionHelper.ts";

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
    async updateClass(id: string, updateData: UpdateClassDTO, teacherId: string) {
        const classObj = await ClassRepo.getClassById(id);
        if (!classObj) {
            return null;
        }
        if (classObj.teacher_id.toString() !== teacherId) {
            return { error: "You can only update your own class" };
        }
        return await ClassRepo.updateClass(id, updateData);
    }
    async getStudentsByClass(classId: string, page: number, keyword: string) {
        return await ClassRepo.getStudentsByClass(classId, page, keyword);
    }
    async generateKeypass(classId: string) {
        const keypass = generateRandomString();
        const teacherClass = await this.getClassById(classId);
        if (!teacherClass) {
            return { error: "Class not found" };
        }
        teacherClass.keypass = keypass;
        await teacherClass?.save();
        return keypass;
    }

    async deleteClass(id: string) {
        return await ClassRepo.deleteClass(id);
    }

    /**
     * Cascade delete a class and all related entities using atomic transaction.
     * 
     * This method performs a complete cascade deletion of a class and all its
     * associated data. All deletions occur within a MongoDB transaction to ensure
     * atomicity - either all entities are deleted or none are (rollback on failure).
     * 
     * Returns structured results following no-throwing pattern:
     * - Never throws exceptions for expected conditions (not found, forbidden)
     * - Returns structured objects with success/error indicators
     * - Provides detailed deletion counts on success
     * 
     * Deletion order (maintains referential integrity):
     * 1. Results (via QuizAttempts)
     * 2. QuizAttempts (via Quiz)
     * 3. Questions (via Quiz)
     * 4. Quiz/File/Slide/Render2D (via ClassMaterial content_id)
     * 5. AiRequest (via AiContent)
     * 6. AiContent (via ClassMaterial ai_content_id)
     * 7. Feedback (via ClassMaterial)
     * 8. ProgressClassMaterial (via Enroll)
     * 9. Enroll
     * 10. ClassMaterial
     * 11. Class
     * 
     * @param {string} classId - MongoDB ObjectId of the class to delete
     * @param {string} [teacherId] - Optional teacher ID for ownership verification.
     *                               If provided, verifies teacher owns the class.
     *                               Omit for admin deletions (no ownership check).
     * 
     * @returns {Promise<Object>} Structured result object
     * 
     * @returns {Object} Success response
     * @returns {boolean} success - true
     * @returns {string} message - "Class deleted successfully"
     * @returns {Object} deletedCounts - Breakdown of deleted entities by type
     * @returns {number} deletedCounts.classes - Classes deleted (always 1)
     * @returns {number} deletedCounts.classMaterials - Class materials deleted
     * @returns {number} deletedCounts.enrolls - Enrollments deleted
     * @returns {number} deletedCounts.feedback - Feedback records deleted
     * @returns {number} deletedCounts.files - File entities deleted
     * @returns {number} deletedCounts.progressClassMaterial - Progress records deleted
     * @returns {number} deletedCounts.questions - Questions deleted
     * @returns {number} deletedCounts.quizzes - Quizzes deleted
     * @returns {number} deletedCounts.quizAttempts - Quiz attempts deleted
     * @returns {number} deletedCounts.render2d - Render2D objects deleted
     * @returns {number} deletedCounts.results - Result records deleted
     * @returns {number} deletedCounts.slides - Slides deleted
     * @returns {number} deletedCounts.aiContents - AI content records deleted
     * @returns {number} deletedCounts.aiRequests - AI request records deleted
     * 
     * @returns {Object} Error response (not found)
     * @returns {boolean} success - false
     * @returns {string} error - "Class not found"
     * @returns {null} result - null
     * 
     * @returns {Object} Error response (forbidden)
     * @returns {boolean} success - false
     * @returns {string} error - "Not allowed"
     * @returns {null} result - null
     * 
     * @returns {Object} Error response (transaction failed)
     * @returns {boolean} success - false
     * @returns {string} error - "delete_failed"
     * @returns {Object} details - Error details
     * @returns {string} details.message - Error message from transaction
     * 
     * @example
     * // Teacher deletion (with ownership check)
     * const result = await ClassService.deleteClassCascade(classId, teacherId);
     * if (result.success) {
     *   console.log(`Deleted ${result.deletedCounts.enrolls} enrollments`);
     *   console.log(`Deleted ${result.deletedCounts.aiContents} AI contents`);
     * }
     * 
     * @example
     * // Admin deletion (no ownership check)
     * const result = await ClassService.deleteClassCascade(classId);
     * 
     * @throws Never throws - returns structured error objects instead
     * 
     * @notes
     * - Uses Mongoose session-based transaction
     * - Automatically rolls back on any failure
     * - Logs errors to console for debugging
     * - External file cleanup (S3/Cloudinary) may need separate handling
     * - Uses ContentDeletionHelper for reusable content deletion logic
     */
    async deleteClassCascade(classId: string, teacherId?: string) {
        const session = await mongoose.startSession();

        try {
            // Check if class exists
            const classObj = await ClassRepo.getClassById(classId);
            if (!classObj) {
                return {
                    success: false,
                    error: "Class not found",
                    result: null
                };
            }

            // Verify ownership if teacherId provided
            if (teacherId && classObj.teacher_id.toString() !== teacherId) {
                return {
                    success: false,
                    error: "Not allowed",
                    result: null
                };
            }

            await session.startTransaction();

            const deletedCounts: any = {
                classes: 0,
                classMaterials: 0,
                enrolls: 0,
                feedback: 0,
                files: 0,
                progressClassMaterial: 0,
                questions: 0,
                quizzes: 0,
                quizAttempts: 0,
                render2d: 0,
                results: 0,
                slides: 0,
                aiContents: 0,
                aiRequests: 0
            };

            // Step 1: Get all ClassMaterials for this class
            const classMaterials = await ClassMaterial.find({
                class_assign_id: classId
            }).session(session);

            // Step 2: Delete content and related data for each ClassMaterial
            for (const material of classMaterials) {
                // Use ContentDeletionHelper for cascade deletion of content and AI entities
                const counts = await ContentDeletionHelper.deleteContentByMaterial(material, session);
                ContentDeletionHelper.addCounts(deletedCounts, counts);
            }

            // Step 3: Get all enrolls for this class
            const enrolls = await Enroll.find({
                class_id: classId
            }).session(session);

            // Step 4: Delete ProgressClassMaterial for each enroll
            for (const enroll of enrolls) {
                const progressDeleted = await ProgressClassMaterial.deleteMany({
                    enroll_id: enroll._id
                }).session(session);
                deletedCounts.progressClassMaterial += progressDeleted.deletedCount || 0;
            }

            // Step 5: Delete all enrolls
            const enrollsDeleted = await Enroll.deleteMany({
                class_id: classId
            }).session(session);
            deletedCounts.enrolls += enrollsDeleted.deletedCount || 0;

            // Step 6: Delete all class materials
            const materialsDeleted = await ClassMaterial.deleteMany({
                class_assign_id: classId
            }).session(session);
            deletedCounts.classMaterials += materialsDeleted.deletedCount || 0;

            // Step 7: Delete the class itself
            const classDeleted = await classObj.deleteOne({ session });
            deletedCounts.classes = classDeleted.deletedCount || 1;

            await session.commitTransaction();

            return {
                success: true,
                message: "Class deleted successfully",
                deletedCounts
            };

        } catch (error: any) {
            await session.abortTransaction();
            console.error("Error in deleteClassCascade:", error);

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
    async verifyImageOwnership(url: string, teacherId: string) {
        const classObj = await ClassRepo.findByImageUrl(url);
        if (!classObj) {
            return { error: "No class found with this image" };
        }
        if (classObj.teacher_id.toString() !== teacherId) {
            return { error: "You can only modify images of your own class" };
        }
        return null;
    }
    async updateClassImage(oldUrl: string, newUrl: string, teacherId: string) {
        const classObj = await ClassRepo.findByImageUrl(oldUrl);
        if (!classObj) return { error: 'No class found with this image' };
        if (classObj.teacher_id.toString() !== teacherId) return { error: 'You can only modify images of your own class' };
        return await ClassRepo.updateClass(classObj._id.toString(), { img_cover_link: newUrl });
    }
    async clearClassImage(oldUrl: string, teacherId: string) {
        const classObj = await ClassRepo.findByImageUrl(oldUrl);
        if (!classObj) return { error: 'No class found with this image' };
        if (classObj.teacher_id.toString() !== teacherId) return { error: 'You can only modify images of your own class' };
        return await ClassRepo.updateClass(classObj._id.toString(), { img_cover_link: null });
    }

    async getAdminClassStats(timeRange: string = '30days', status: string = 'all') {
        const validTimeRanges = ['7days', '30days', '3months', '1year', 'all'];
        const validStatuses = ['active', 'inactive', 'all'];

        if (!validTimeRanges.includes(timeRange)) {
            return { error: "Invalid timeRange parameter. Must be one of: 7days, 30days, 3months, 1year, all" };
        }
        if (!validStatuses.includes(status)) {
            return { error: "Invalid status parameter. Must be one of: active, inactive, all" };
        }

        const stats = await ClassRepo.getAdminClassStats(timeRange, status);

        // Format byStatus data
        const byStatus: any = {};
        if (stats.byStatus) {
            stats.byStatus.forEach((item: any) => {
                byStatus[item._id] = item.count;
            });
        }

        // Format trend data
        const trend = stats.trend || [];
        const trendData = trend.map((item: any) => ({
            date: item._id,
            count: item.count
        }));

        // Calculate total
        const totalClasses = stats.total && stats.total[0] ? stats.total[0].count : 0;

        // Format top enrolled classes
        const topEnrolledClasses = stats.topEnrolled.map((item: any) => ({
            className: item.className,
            enrollments: item.enrollments,
            classId: item.classId?.toString()
        }));

        // Calculate average class size
        const averageClassSize = Math.round(stats.avgClassSize * 10) / 10;

        return {
            timeRange,
            status,
            totalClasses,
            byStatus,
            averageClassSize,
            topEnrolledClasses,
            trend: trendData
        };
    }
}
export default new ClassService;