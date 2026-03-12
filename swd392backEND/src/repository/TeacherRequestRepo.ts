import mongoose from 'mongoose';
import { TeacherRequest } from '../entities/TeacherRequest.ts';
import { Teacher } from '../entities/Teacher.ts';
import { User } from '../entities/User.ts';
import type { CreateTeacherRequestDTO } from '../dto/TeacherRequestDTO.ts';

class TeacherRequestRepo {
    async getById(id: string) {
        return await TeacherRequest.findById(id);
    }

    async getList(opts: {
        page: number;
        limit: number;
        status?: string;
        q?: string;
    }) {
        const { page, limit, status, q } = opts;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};

        if (status && status !== 'all') {
            filter.status = status;
        }
        if (q && q.trim()) {
            const regex = { $regex: q.trim(), $options: 'i' };
            filter.$or = [{ full_name: regex }, { email: regex }];
        }

        const [data, total] = await Promise.all([
            TeacherRequest.find(filter)
                .select('-attachments')       // keep list payload small
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(limit),
            TeacherRequest.countDocuments(filter),
        ]);

        return { data, total };
    }

    async create(dto: CreateTeacherRequestDTO) {
        const request = new TeacherRequest(dto);
        return await request.save();
    }

    async markApproved(
        id: string,
        adminUserId: string,
        session: mongoose.ClientSession
    ) {
        return await TeacherRequest.findByIdAndUpdate(
            id,
            {
                status: 'approved',
                processed_by: adminUserId,
                processed_at: new Date(),
            },
            { new: true, session }
        );
    }

    async markRejected(
        id: string,
        adminUserId: string,
        reason: string | undefined,
        session: mongoose.ClientSession
    ) {
        return await TeacherRequest.findByIdAndUpdate(
            id,
            {
                status: 'rejected',
                processed_by: adminUserId,
                processed_at: new Date(),
                reason: reason ?? null,
            },
            { new: true, session }
        );
    }

    /** Upsert a Teacher document for the given user. Returns { doc, created }. */
    async upsertTeacher(
        userId: string,
        credential: string | undefined,
        session: mongoose.ClientSession
    ): Promise<{ doc: any; created: boolean }> {
        const existing = await Teacher.findOne({ user_id: userId }).session(session);
        if (existing) {
            return { doc: existing, created: false };
        }
        const newTeacher = new Teacher({ user_id: userId, credential: credential, date_create: new Date() });
        const doc = await newTeacher.save({ session });
        return { doc, created: true };
    }

    /** Promote user role to 'teacher'. */
    async promoteUserToTeacher(userId: string, session: mongoose.ClientSession) {
        return await User.findByIdAndUpdate(
            userId,
            { role: 'teacher' },
            { new: true, session }
        );
    }
}

export default new TeacherRequestRepo();
