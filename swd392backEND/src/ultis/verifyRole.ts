import type { NextFunction, Request, Response } from "express";
import UserService from "../services/UserService.ts";
import { UserGetFromTokenSchema } from "../dto/UserDTO.ts";

class VerifyRole {
    async verifyAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.signedCookies.Authorization;
            const verified = UserGetFromTokenSchema.parse(UserService.verifyToken(token as string));
            if (verified.role === 'admin') {
                return next();
            }
            return res.status(403).json({ message: "Forbidden: Admins only" });
        } catch (error) {
            return res.status(403).json({ message: "Forbidden: Admins only" });
        }
    }
    async verifyTeacher(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.signedCookies.Authorization;
            const verified = UserGetFromTokenSchema.parse(UserService.verifyToken(token as string));
            if (verified.role === 'teacher') {
                return next();
            }
            return res.status(403).json({ message: "Forbidden: Teachers only" });
        } catch (error) {
            return res.status(403).json({ message: "Forbidden: Teachers only" });
        }
    }
    async verifyModerator(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.signedCookies.Authorization;
            const verified = UserGetFromTokenSchema.parse(UserService.verifyToken(token as string));
            if (verified.role === 'moderator') {
                return next();
            }
            return res.status(403).json({ message: "Forbidden: Moderators only" });
        } catch (error) {
            return res.status(403).json({ message: "Forbidden: Moderators only" });
        }
    }
    async verifyStudent(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.signedCookies?.Authorization;
            const verified = UserGetFromTokenSchema.parse(UserService.verifyToken(token as string));
            if (verified.role === 'student') {
                return next();
            }
            return res.status(403).json({ message: "Forbidden: Students only" });
        } catch (error) {
            return res.status(403).json({ message: "Forbidden: Students only" });
        }
    }
}
export default new VerifyRole();