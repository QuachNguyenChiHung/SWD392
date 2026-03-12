import { Router } from 'express';
import TeacherRequestController from '../controller/TeacherRequestController.ts';
import verifyRole from '../ultis/verifyRole.ts';

const router = Router();

// All teacher-request admin endpoints require admin role
router.get('/admin/teacher-requests', verifyRole.verifyAdmin, TeacherRequestController.getList);
router.get('/admin/teacher-requests/:id', verifyRole.verifyAdmin, TeacherRequestController.getById);
router.patch('/admin/teacher-requests/:id', verifyRole.verifyAdmin, TeacherRequestController.processRequest);

export default router;
