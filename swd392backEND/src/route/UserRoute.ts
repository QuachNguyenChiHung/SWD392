import { Router } from "express";
import UserController from "../controller/UserController.ts";
import verifyRole from "../ultis/verifyRole.ts";
import { filesMulterUpload } from "../ultis/cloudinary.ts";
const router = Router();
// Admin statistics for users
router.get('/admin/stats/users', verifyRole.verifyAdmin, UserController.getAdminUserStats);

// Search users by keyword functionality
router.get('/users/search', verifyRole.verifyAdminOrModerator, UserController.findByKeyWord);
router.get('/users', verifyRole.verifyAdminOrModerator, UserController.getAllUsers);
router.get('/users/:id', verifyRole.verifyAdminOrModerator, UserController.getUserById);
router.post('/users', verifyRole.verifyAdmin, filesMulterUpload.single('credentialFile'), UserController.createUser);
router.patch('/users/:id', verifyRole.verifyAdmin, UserController.updateUser);
router.delete('/users/:id', verifyRole.verifyAdmin, UserController.deleteUser);

// User status toggle route, only for admin to use, prevent user from updating their own status by themselves
router.patch('/users/:id/status', verifyRole.verifyAdminOrModerator, UserController.toggleStatus);

// Authentication routes
router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUser);
router.post('/google-login', UserController.googleLogin);
router.get('/me', UserController.getUserInfo);
router.get('/user/profile', verifyRole.verifyStudent, UserController.getUserProfile);
router.get('/admin/profile', verifyRole.verifyAdmin, UserController.getUserAdminProfile);
router.get('/teacher/profile', verifyRole.verifyTeacher, UserController.getUserTeacherProfile);
router.patch('/teacher/profile/password', verifyRole.verifyTeacher, UserController.updateSelf);
router.get('/admin/moderators', verifyRole.verifyAdmin, UserController.getListModerators);
router.delete('/admin/moderators/:id', verifyRole.verifyAdmin, UserController.deleteModerator);
// Update own profile, but needs to update token(fix this later)
router.patch('/me', UserController.updateSelf);
// Logout route
router.post('/logout', UserController.removeToken);

export default router;
