import mongoose from 'mongoose';
import TeacherRequestRepo from '../repository/TeacherRequestRepo.ts';
import type { CreateTeacherRequestDTO } from '../dto/TeacherRequestDTO.ts';

class TeacherRequestService {
    /** List teacher requests with pagination / filtering. Returns { total, data }. */
    async getList(opts: {
        page: number;
        limit: number;
        status?: string;
        q?: string;
    }) {
        return await TeacherRequestRepo.getList(opts);
    }

    /** Fetch a single request by ID. Returns null if not found. */
    async getById(id: string) {
        return await TeacherRequestRepo.getById(id);
    }

    /** Create a new teacher request (called by user/student). */
    async create(dto: CreateTeacherRequestDTO) {
        return await TeacherRequestRepo.create(dto);
    }

    /**
     * Approve a teacher request.
     * - Validates request exists and is still pending.
     * - Inside a transaction:
     *   1. Sets request status = 'approved'
     *   2. Upserts Teacher record
     *   3. Promotes User role to 'teacher'
     * 
     * Returns null if request not found.
     * Throws Error("ALREADY_PROCESSED") if status is not 'pending'.
     */
    async approve(requestId: string, adminUserId: string) {
        const request = await TeacherRequestRepo.getById(requestId);
        if (!request) return null;

        if (request.status !== 'pending') {
            throw new Error('ALREADY_PROCESSED');
        }

        const session = await mongoose.startSession();
        let updatedRequest: any;
        let teacherCreated = false;

        try {
            await session.withTransaction(async () => {
                updatedRequest = await TeacherRequestRepo.markApproved(
                    requestId,
                    adminUserId,
                    session
                );

                const { created } = await TeacherRequestRepo.upsertTeacher(
                    request.user_id.toString(),
                    request.credential,
                    session
                );
                teacherCreated = created;

                await TeacherRequestRepo.promoteUserToTeacher(
                    request.user_id.toString(),
                    session
                );
            });
        } finally {
            await session.endSession();
        }

        console.log(
            `[TeacherRequest] APPROVED id=${requestId} by admin=${adminUserId} at=${new Date().toISOString()} teacherCreated=${teacherCreated}`
        );

        return { updatedRequest, teacherCreated };
    }

    /**
     * Reject a teacher request.
     * 
     * Returns null if request not found.
     * Throws Error("ALREADY_PROCESSED") if status is not 'pending'.
     */
    async reject(requestId: string, adminUserId: string, reason?: string) {
        const request = await TeacherRequestRepo.getById(requestId);
        if (!request) return null;

        if (request.status !== 'pending') {
            throw new Error('ALREADY_PROCESSED');
        }

        const session = await mongoose.startSession();
        let updatedRequest: any;

        try {
            await session.withTransaction(async () => {
                updatedRequest = await TeacherRequestRepo.markRejected(
                    requestId,
                    adminUserId,
                    reason,
                    session
                );
            });
        } finally {
            await session.endSession();
        }

        console.log(
            `[TeacherRequest] REJECTED id=${requestId} by admin=${adminUserId} at=${new Date().toISOString()} reason=${reason ?? 'none'}`
        );

        return { updatedRequest };
    }
}

export default new TeacherRequestService();
