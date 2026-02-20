import type { NextFunction, Request, Response } from "express";
import UserService from "../services/UserService.ts";
import { UserGetFromTokenSchema } from "../dto/UserDTO.ts";

class VerifyRole {
    async verifyAdmin(req: Request, res: Response, next: NextFunction) {// verify if the user is an admin
        try {
            const token = req.signedCookies.Authorization;
            const user = await UserService.getUserByToken(token as string);
            const verified = UserGetFromTokenSchema.parse(user);
            if (verified.role === 'admin') {
                req.user = verified; // attach user info to request object for later use
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
            if (verified.role === 'teacher') {
                req.user = verified; // attach user info to request object for later use
                return next();
            }
            return res.status(403).json({ message: "Forbidden: Teachers only" });
        } catch (error) {
            return res.status(403).json({ message: "Forbidden: Invalid token" });
        }
    }
    async verifyModerator(req: Request, res: Response, next: NextFunction) {//verify if the user is a moderator
        try {
            const token = req.signedCookies.Authorization;
            const user = await UserService.getUserByToken(token as string);
            const verified = UserGetFromTokenSchema.parse(user);
            if (verified.role === 'moderator') {
                req.user = verified; // attach user info to request object for later use
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