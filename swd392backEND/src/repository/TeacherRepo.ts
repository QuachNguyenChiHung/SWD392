import { Teacher } from '../entities/Teacher.ts';

class TeacherRepo {
    /** Get teacher by teacher document id and populate user (exclude password). */
    async getById(id: string) {
        return await Teacher.findById(id).populate('user_id', '-password -__v');
    }

    /** Get teacher by user id and populate user (exclude password). */
    async getByUserId(userId: string) {
        return await Teacher.findOne({ user_id: userId }).populate('user_id', '-password -__v');
    }
}

export default new TeacherRepo();
