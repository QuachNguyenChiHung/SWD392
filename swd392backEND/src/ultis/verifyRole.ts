import type { NextFunction, Request, Response } from "express";
import UserService from "../services/UserService.ts";
import { UserGetFromTokenSchema } from "../dto/UserDTO.ts";
import { Admin } from "../entities/Admin.ts";
import { Teacher } from "../entities/Teacher.ts";

class VerifyRole {
    async verifyAdmin(req: Request, res: Response, next: NextFunction) {// verify if the user is an admin
        try {
            const token = req.signedCookies.Authorization;
            const user = await UserService.getUserByToken(token as string);
            const verified = UserGetFromTokenSchema.parse(user);

            // Query Admin entity and verify authorization_lvl is 2
            const admin = await Admin.findOne({ user_id: verified.id });
            if (admin && admin.authorization_lvl === 2) {
                req.user = verified;
                req.admin = admin;
                return next();
            }
            return res.status(403).json({ message: "Forbidden: Admins only" });
        } catch (error) {
            return res.status(403).json({ message: "Forbidden: Invalid token" });
        }
    }
    async verifyTeacher(req: Request, res: Response, next: NextFunction) {// verify if the user is a teacher
        try {
            const token = req.signedCookies.Authorization;
            const user = await UserService.getUserByToken(token as string);
            const verified = UserGetFromTokenSchema.parse(user);
            console.log("Verified user from token:", verified);
            // Query Teacher entity to get teacher_id
            const teacher = await Teacher.findOne({ user_id: verified.id });
            if (teacher && verified.role === 'teacher') {
                req.user = verified;
                req.teacher = teacher;
                console.log("Verified teacher:", teacher);

                return next();
            }
            return res.status(403).json({ message: "Forbidden: Teachers only" });
        } catch (error) {
            return res.status(403).json({ message: "Forbidden: Invalid token" });
        }
    }
    async verifyUser(req: Request, res: Response, next: NextFunction) {// verify if the user is a teacher
        try {
            const token = req.signedCookies.Authorization;
            const user = await UserService.getUserByToken(token as string);
            const verified = UserGetFromTokenSchema.parse(user);
            console.log("Verified user from token:", verified);
            req.user = verified;
            // Query Teacher entity to get teacher_id
            return next();
        } catch (error) {
            return res.status(403).json({ message: "Forbidden: Invalid token" });
        }
    }
    async verifyModerator(req: Request, res: Response, next: NextFunction) {//verify if the user is a moderator
        try {
            const token = req.signedCookies.Authorization;
            const user = await UserService.getUserByToken(token as string);
            const verified = UserGetFromTokenSchema.parse(user);

            // Query Admin entity and verify authorization_lvl is 1
            const admin = await Admin.findOne({ user_id: verified.id });
            if (admin && admin.authorization_lvl === 1) {
                req.user = verified;
                req.admin = admin;
                return next();
            }
            return res.status(403).json({ message: "Forbidden: Moderators only" });
        } catch (error) {
            return res.status(403).json({ message: "Forbidden: Invalid token" });
        }
    }
    async verifyStudent(req: Request, res: Response, next: NextFunction) {// verify if the user is a student
        try {
            const token = req.signedCookies?.Authorization;
            const user = await UserService.getUserByToken(token as string);
            const verified = UserGetFromTokenSchema.parse(user);
            if (verified.role === 'student') {
                req.user = verified; // attach user info to request object for later use
                return next();
            }
            return res.status(403).json({ message: "Forbidden: Students only" });
        } catch (error) {
            return res.status(403).json({ message: "Forbidden: Invalid token" });
        }
    }
}
export default new VerifyRole();