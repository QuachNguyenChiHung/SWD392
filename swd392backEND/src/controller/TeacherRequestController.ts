import type { NextFunction, Request, Response } from 'express';
import TeacherRequestService from '../services/TeacherRequestService.ts';
import { processTeacherRequestSchema } from '../dto/TeacherRequestDTO.ts';

class TeacherRequestController {
    /** GET /api/admin/teacher-requests */
    async getList(req: Request, res: Response, next: NextFunction) {
        try {
            const page = Math.max(1, parseInt(req.query.page as string) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 12));
            const status = (req.query.status as string) || 'all';
            const q = (req.query.q as string) || '';

            const validStatuses = ['pending', 'approved', 'rejected', 'all'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
            }

            const result = await TeacherRequestService.getList({ page, limit, status, q });
            return res.status(200).json({
                total: result.total,
                page,
                limit,
                data: result.data,
            });
        } catch (error) {
            next(error);
        }
    }

    /** GET /api/admin/teacher-requests/:id */
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const request = await TeacherRequestService.getById(req.params.id as string);
            if (!request) {
                return res.status(404).json({ error: 'Teacher request not found' });
            }
            return res.status(200).json(request);
        } catch (error) {
            next(error);
        }
    }

    /** PATCH /api/admin/teacher-requests/:id */
    async processRequest(req: Request, res: Response, next: NextFunction) {
        try {
            const parseResult = processTeacherRequestSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error.issues.map((e: { message: string }) => e.message).join(', ') });
            }

            const { action, reason } = parseResult.data;
            const adminUserId = req.user?.id;

            if (!adminUserId) {
                return res.status(401).json({ error: 'Unauthorized: Unable to identify admin user' });
            }

            let result: any;

            if (action === 'approve') {
                result = await TeacherRequestService.approve(req.params.id as string, adminUserId);
                if (!result) {
                    return res.status(404).json({ error: 'Teacher request not found' });
                }
                return res.status(200).json({
                    updatedRequest: result.updatedRequest,
                    teacherCreated: result.teacherCreated,
                });
            }

            if (action === 'reject') {
                result = await TeacherRequestService.reject(req.params.id as string, adminUserId, reason);
                if (!result) {
                    return res.status(404).json({ error: 'Teacher request not found' });
                }
                return res.status(200).json({
                    updatedRequest: result.updatedRequest,
                });
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'ALREADY_PROCESSED') {
                return res.status(400).json({ error: 'This request has already been approved or rejected' });
            }
            next(error);
        }
    }
}

export default new TeacherRequestController();
