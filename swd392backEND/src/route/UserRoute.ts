import { Router } from "express";
import UserController from "../controller/UserController.ts";
import verifyRole from "../ultis/verifyRole.ts";
import { filesMulterUpload } from "../ultis/cloudinary.ts";
const route = Router();
// Admin statistics for users
route.get('/admin/stats/users', verifyRole.verifyAdmin, UserController.getAdminUserStats);

// Search users by keyword functionality
route.get('/users/search', verifyRole.verifyAdminOrModerator, UserController.findByKeyWord);
route.get('/users', verifyRole.verifyAdminOrModerator, UserController.getAllUsers);
route.get('/users/:id', verifyRole.verifyAdminOrModerator, UserController.getUserById);
route.post('/users', verifyRole.verifyAdmin, filesMulterUpload.single('credentialFile'), UserController.createUser);
route.patch('/users/:id', verifyRole.verifyAdmin, UserController.updateUser);
route.delete('/users/:id', verifyRole.verifyAdmin, UserController.deleteUser);

// User status toggle route, only for admin to use, prevent user from updating their own status by themselves
route.patch('/users/:id/status', verifyRole.verifyAdminOrModerator, UserController.toggleStatus);

// Authentication routes
route.post('/register', UserController.registerUser);
route.post('/login', UserController.loginUser);
route.post('/google-login', UserController.googleLogin);
route.get('/me', UserController.getUserInfo);
route.get('/user/profile', verifyRole.verifyStudent, UserController.getUserProfile);
route.get('/admin/profile', verifyRole.verifyAdmin, UserController.getUserAdminProfile);
route.get('/teacher/profile', verifyRole.verifyTeacher, UserController.getUserTeacherProfile);
route.patch('/teacher/profile/password', verifyRole.verifyTeacher, UserController.updateSelf);
route.get('/admin/moderators', verifyRole.verifyAdmin, UserController.getListModerators);
route.delete('/admin/moderators/:id', verifyRole.verifyAdmin, UserController.deleteModerator);
// Update own profile, but needs to update token(fix this later)
route.patch('/me', UserController.updateSelf);
// Logout route
route.post('/logout', UserController.removeToken);

export default route;
