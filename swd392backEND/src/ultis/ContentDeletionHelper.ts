import type { ClientSession } from "mongoose";
import type { IClassMaterial } from "../interface/IClassMaterial.ts";
import { Quiz } from "../entities/Quiz.ts";
import { Question } from "../entities/Question.ts";
import { QuizAttempt } from "../entities/QuizAttempt.ts";
import { Result } from "../entities/Result.ts";
import { File } from "../entities/File.ts";
import { Slide } from "../entities/Slide.ts";
import { Render2D } from "../entities/Render2D.ts";
import { Feedback } from "../entities/Feedback.ts";
import { AiContent } from "../entities/AiContent.ts";
import { AiRequest } from "../entities/AiRequest.ts";

/**
 * Helper utility for cascade deletion of ClassMaterial content entities.
 * 
 * Provides shared logic for deleting content referenced by ClassMaterial
 * including quiz, file, slide, render2d, AiContent, and AiRequest.
 * Used by both ClassService and TopicService cascade deletions.
 */
class ContentDeletionHelper {
    /**
     * Delete all content entities associated with a ClassMaterial.
     * 
     * Handles deletion of:
     * - Quiz (with questions, attempts, and results)
     * - File
     * - Slide
     * - Render2D
     * - AiContent (with associated AiRequests)
     * - Feedback
     * 
     * @param {IClassMaterial} material - The class material to delete content for
     * @param {ClientSession} session - Mongoose transaction session
     * @returns {Promise<Object>} Deletion counts for each entity type
     * 
     * @example
     * const counts = await ContentDeletionHelper.deleteContentByMaterial(material, session);
     * console.log(`Deleted ${counts.quizzes} quizzes, ${counts.aiContents} AI contents`);
     */
    async deleteContentByMaterial(material: IClassMaterial, session: ClientSession) {
        const deletedCounts: any = {
            quizzes: 0,
            questions: 0,
            quizAttempts: 0,
            results: 0,
            files: 0,
            slides: 0,
            render2d: 0,
            feedback: 0,
            aiContents: 0,
            aiRequests: 0
        };

        const contentId = material.content_id;

        // Delete content based on material type
        if (contentId) {
            switch (material.type) {
                case 'quiz':
                    // Delete quiz and all related entities
                    const quizAttempts = await QuizAttempt.find({
                        quiz_id: contentId
                    }).session(session);

                    // Delete results for each quiz attempt
                    for (const attempt of quizAttempts) {
                        const resultDeleted = await Result.deleteMany({
                            quiz_attempt_id: attempt._id
                        }).session(session);
                        deletedCounts.results += resultDeleted.deletedCount || 0;
                    }

                    // Delete quiz attempts
                    const attemptsDeleted = await QuizAttempt.deleteMany({
                        quiz_id: contentId
                    }).session(session);
                    deletedCounts.quizAttempts += attemptsDeleted.deletedCount || 0;

                    // Delete questions
                    const questionsDeleted = await Question.deleteMany({
                        quiz_id: contentId
                    }).session(session);
                    deletedCounts.questions += questionsDeleted.deletedCount || 0;

                    // Delete quiz
                    const quizDeleted = await Quiz.deleteOne({
                        _id: contentId
                    }).session(session);
                    deletedCounts.quizzes += quizDeleted.deletedCount || 0;
                    break;

                case 'file':
                    const fileDeleted = await File.deleteOne({
                        _id: contentId
                    }).session(session);
                    deletedCounts.files += fileDeleted.deletedCount || 0;
                    break;

                case 'slide':
                    const slideDeleted = await Slide.deleteOne({
                        _id: contentId
                    }).session(session);
                    deletedCounts.slides += slideDeleted.deletedCount || 0;
                    break;

                case '2d_render':
                    const render2dDeleted = await Render2D.deleteOne({
                        _id: contentId
                    }).session(session);
                    deletedCounts.render2d += render2dDeleted.deletedCount || 0;
                    break;
            }
        }

        // Delete AI content if referenced
        if (material.ai_content_id) {
            // Find the AiContent to get its ai_request_id
            const aiContent = await AiContent.findById(material.ai_content_id).session(session);

            if (aiContent) {
                // Delete associated AiRequest first
                if (aiContent.ai_request_id) {
                    const aiRequestDeleted = await AiRequest.deleteOne({
                        _id: aiContent.ai_request_id
                    }).session(session);
                    deletedCounts.aiRequests += aiRequestDeleted.deletedCount || 0;
                }

                // Delete AiContent
                const aiContentDeleted = await AiContent.deleteOne({
                    _id: material.ai_content_id
                }).session(session);
                deletedCounts.aiContents += aiContentDeleted.deletedCount || 0;
            }
        }

        // Delete feedback for this material
        const feedbackDeleted = await Feedback.deleteMany({
            material_id: material._id
        }).session(session);
        deletedCounts.feedback += feedbackDeleted.deletedCount || 0;

        return deletedCounts;
    }

    /**
     * Aggregate deletion counts from multiple material deletions.
     * 
     * @param {Object} target - Target counts object to add to
     * @param {Object} source - Source counts to add from
     */
    addCounts(target: any, source: any) {
        for (const key in source) {
            if (typeof source[key] === 'number') {
                target[key] = (target[key] || 0) + source[key];
            }
        }
    }
}

export default new ContentDeletionHelper();
