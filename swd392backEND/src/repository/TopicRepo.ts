import type { TopicCreateDTO, TopicUpdateDTO } from "../dto/TopicDTO.ts";
import { Topic } from "../entities/Topic.ts";
import type { ClientSession } from "mongoose";

class TopicRepo {
    async getAllTopics(page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await Topic.find().populate('course_id', 'course_name grade_level').skip(skip).limit(limit);
    }

    async getTopicById(id: string) {
        return await Topic.findById(id).populate('course_id', 'course_name grade_level');
    }

    async createTopic(topicData: TopicCreateDTO) {
        const topic = new Topic(topicData);
        const savedTopic = await topic.save();
        return await savedTopic.populate('course_id', 'course_name grade_level');
    }

    async updateTopic(id: string, updateData: TopicUpdateDTO) {
        return await Topic.findByIdAndUpdate(id, updateData, { new: true })
            .populate('course_id', 'course_name grade_level');
    }

    async deleteTopic(id: string) {
        return await Topic.findByIdAndDelete(id);
    }

    /**
     * Delete a topic within a transaction session.
     * 
     * This method is used for cascade deletions within transactions to ensure
     * atomicity across multiple entity deletions.
     * 
     * @param {string} id - MongoDB ObjectId of the topic to delete
     * @param {ClientSession} session - Mongoose session for transaction
     * @returns {Promise<ITopic | null>} Deleted topic document or null if not found
     * 
     * @example
     * const session = await mongoose.startSession();
     * await session.startTransaction();
     * try {
     *   const deleted = await TopicRepo.deleteTopicWithSession(topicId, session);
     *   await session.commitTransaction();
     * } catch (error) {
     *   await session.abortTransaction();
     * } finally {
     *   session.endSession();
     * }
     */
    async deleteTopicWithSession(id: string, session: ClientSession) {
        return await Topic.findByIdAndDelete(id, { session });
    }

    async getTopicsByCourseId(courseId: string) {
        return await Topic.find({ course_id: courseId })
            .populate('course_id', 'course_name grade_level');
    }

    async findByTitle(title: string) {
        return await Topic.findOne({ title: title });
    }

    async findByKeyword(keyword: string, page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await Topic.find({
            $or: [
                { title: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ]
        }).populate('course_id', 'course_name grade_level').skip(skip).limit(limit);
    }

    async deleteTopicsByCourseId(courseId: string) {
        return await Topic.deleteMany({ course_id: courseId });
    }

    async getTopicsCountByCourse(courseId: string) {
        return await Topic.countDocuments({ course_id: courseId });
    }

    async getTotalTopicsCount() {
        return await Topic.countDocuments();
    }

    async getTopicsByCourseIdWithPagination(courseId: string, page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await Topic.find({ course_id: courseId })
            .populate('course_id', 'course_name grade_level')
            .skip(skip)
            .limit(limit);
    }
}

export default new TopicRepo();