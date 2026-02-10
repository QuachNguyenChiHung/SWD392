import { Router } from "express";
import UserController from "../controller/UserController.ts";
const route = Router();

route.get('/users', UserController.getAllUsers);
route.get('/users/:id', UserController.getUserById);
route.post('/users', UserController.createUser);
route.patch('/users/:id', UserController.updateUser);
route.delete('/users/:id', UserController.deleteUser);

// User status management
route.patch('/users/:id/status', UserController.toggleStatus);

// Authentication routes
route.post('/register', UserController.registerUser);
route.post('/login', UserController.loginUser);
route.get('/me', UserController.getUserInfo);
// Logout route
route.post('/logout', UserController.removeToken);

// Search functionality
route.get('/users/search', UserController.findByKeyWord);

export default route;
