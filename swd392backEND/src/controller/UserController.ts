import type { NextFunction, Request, Response } from "express";
import UserService from "../services/UserService.ts";
import zod from "zod";
import { tr } from "zod/locales";
import { loginSchema, registerSchema } from "../dto/AuthDTO.ts";
import { UserGetFromTokenSchema, UserUpdateSchema, type UserGetFromTokenDTO } from "../dto/UserDTO.ts";

class UserController {
    async deleteModerator(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await UserService.getUserById(req.params.id as string);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            if (user.role !== "moderator") {
                return res.status(400).json({ message: "User is not a moderator" });
            }
            const updateBody = UserUpdateSchema.parse({ status: "deleted" });
            const updated = await UserService.updateUser(req.params.id as string, updateBody);
            if (!updated) {
                return res.status(404).json({ message: "User not found" });
            }
            return res.status(200).json(updated);
        } catch (error) {
            next(error);
        }
    }

    async getListModerators(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const moderators = await UserService.getListUsersByRole("moderator", page);
            return res.status(200).json(moderators);
        } catch (error: any) {
            next(error);
        }
    }
    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const users = await UserService.getAllUsers(page);
            return res.status(200).json(users);
        } catch (error: any) {
            next(error);
        }
    }
    async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await UserService.getUserById(req.params.id as string);
            return res.status(200).json(user);
        } catch (error: any) {
            next(error);
        }
    }
    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const created = await UserService.createUser(registerSchema.parse(req.body));
            if (created === "Email already exists") {
                return res.status(400).json({ message: "Email already exists" });
            }
            return res.status(201).json(created);
        } catch (error: any) {
            next(error);
        }
    }
    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const updateBody = UserUpdateSchema.parse(req.body);
            const updated = await UserService.updateUser(req.params.id as string, updateBody);
            if (!updated) {
                return res.status(404).json({ message: "User not found" });
            }
            return res.status(200).json(updated);
        } catch (error: any) {
            next(error);
        }
    }
    async updateSelf(req: Request, res: Response, next: NextFunction) {
        try {
            //prevent user from updating role and status by themselves
            const { role, status, ...rest } = req.body;
            const updateBody = UserUpdateSchema.parse(rest);

            const token = req.signedCookies.Authorization;
            const verified = await UserService.getUserByToken(token as string);
            if (!verified) {
                return res.status(401).json({ message: "Invalid or expired token" });
            }
            const updated = await UserService.updateUser(verified.id.toString(), updateBody);
            if (!updated) {
                return res.status(404).json({ message: "User not found" });
            }
            return res.status(200).json(updated);
        } catch (error: any) {
            next(error);
        }
    }
    // async deleteUser(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const deleted = await UserService.deleteUser(req.params.id as string);
    //         if (!deleted) {
    //             return res.status(404).json({ message: "User not found" });
    //         }
    //         return res.status(200).json(deleted);
    //     } catch (error: any) {
    //         next(error);
    //     }
    // }
    async toggleStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const toggled = await UserService.toggleStatus(req.params.id as string);
            if (!toggled) {
                return res.status(404).json({ message: "User not found" });
            }
            return res.status(200).json(toggled);
        } catch (error: any) {
            next(error);
        }
    }
    async registerUser(req: Request, res: Response, next: NextFunction) {
        try {
            req.body.role = 'student';
            const created = await UserService.createUser(registerSchema.parse(req.body));
            if (created === "Email already exists") {
                return res.status(400).json({ message: "Email already exists" });
            }
            return res.status(201).json(created);
        } catch (error: any) {
            next(error);
        }
    }
    async loginUser(req: Request, res: Response, next: NextFunction) {
        try {
            const p = await UserService.loginUser(loginSchema.parse(req.body));
            if (!p) {
                return res.status(401).json({ message: "Password or email is incorrect" });
            }
            const token = await UserService.generateToken({ "id_": p._id });
            res.cookie('Authorization', `Bearer ${token}`,
                { expires: new Date(Date.now() + 3600000), httpOnly: true, sameSite: 'lax', signed: true });

            return res.status(200).json({ token: token });
        } catch (error: any) {
            next(error);
        }
    }
    async getUserInfo(req: Request, res: Response, next: NextFunction) {
        try {
            // Authorization: Bearer <token>
            //Signed cookies
            const token = req.signedCookies.Authorization;
            const verified = UserGetFromTokenSchema.parse(await UserService.getUserByToken(token as string));
            console.log(verified);
            if (!verified) {
                return res.status(401).json({ message: "Invalid or expired token" });
            }
            return res.status(200).json({ user: verified });
        } catch (error: any) {
            next(error);
        }
    }
    async removeToken(req: Request, res: Response, next: NextFunction) {
        try {
            res.clearCookie('Authorization');
            //the token still valid until it expires, but client cannot send it anymore
            return res.status(200).json({ message: "Logged out successfully" });
        } catch (error: any) {
            next(error);
        }
    }
    async findByKeyWord(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const results = await UserService.findByKeyWord(req.query.keyword as string, page);
            return res.status(200).json(results);
        } catch (error: any) {
            next(error);
        }
    }

    async getAdminUserStats(req: Request, res: Response, next: NextFunction) {
        try {
            const { timeRange, role } = req.query;
            const result = await UserService.getAdminUserStats(
                timeRange as string,
                role as string
            );

            if ((result as any).error) {
                return res.status(400).json(result);
            }

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
export default new UserController();