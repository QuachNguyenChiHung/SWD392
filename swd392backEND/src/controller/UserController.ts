import type { NextFunction, Request, Response } from "express";
import UserService from "../services/UserService.ts";
import TeacherService from "../services/TeacherService.ts";
import { loginSchema, registerSchema, googleLoginSchema } from "../dto/AuthDTO.ts";
import { uploadFile } from "../ultis/cloudinary.ts";
import {
  UserGetFromTokenSchema,
  UserUpdateSchema,
} from "../dto/UserDTO.ts";

class UserController {
  async getUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User profile not found" });
      }

      const userObject = user.toObject();
      const { password, ...safeUser } = userObject;

      return res.status(200).json({ user: safeUser });
    } catch (error) {
      next(error);
    }
  }

  async getUserAdminProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const admin = req.admin;

      if (!userId || !admin) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "Admin user profile not found" });
      }

      const userObject = user.toObject();
      const { password, ...safeUser } = userObject;
      const safeAdmin =
        typeof (admin as any).toObject === "function"
          ? (admin as any).toObject()
          : admin;

      return res.status(200).json({
        user: safeUser,
        admin: safeAdmin,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserTeacherProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const teacherId = req.teacher?._id?.toString();

      if (!userId || !teacherId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const profile = await TeacherService.getUserTeacherProfile(userId, teacherId);
      if (!profile) {
        return res.status(404).json({ message: "Teacher profile not found" });
      }

      return res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  }

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
      const updated = await UserService.updateUser(
        req.params.id as string,
        updateBody,
      );
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
      const moderators = await UserService.getListUsersByRole(
        "moderator",
        page,
      );
      return res.status(200).json(moderators);
    } catch (error: any) {
      next(error);
    }
  }
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const users = await UserService.getAllUsersForAdmin(page);
      return res.status(200).json(users);
    } catch (error: any) {
      next(error);
    }
  }
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getUserByIdForAdmin(req.params.id as string);
      return res.status(200).json(user);
    } catch (error: any) {
      next(error);
    }
  }
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedBody = registerSchema.parse(req.body);

      let credentialLink: string | undefined;
      let credentialFileName: string | undefined;

      if (parsedBody.role === "teacher") {
        if (!req.file) {
          return res
            .status(400)
            .json({ message: "Credential PDF file is required for teacher role" });
        }

        if (req.file.mimetype !== "application/pdf") {
          return res.status(400).json({ message: "Credential file must be a PDF" });
        }

        credentialLink = await uploadFile(req.file.buffer, req.file.originalname);
        credentialFileName = req.file.originalname;
      }

      const created = await UserService.createUser(parsedBody, {
        credentialLink,
        credentialFileName,
      });

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
      if (typeof req.body.role !== "undefined") {
        return res.status(400).json({ message: "Changing user role is not allowed" });
      }

      const { role, ...safeBody } = req.body;
      const updateBody = UserUpdateSchema.parse(safeBody);
      const updated = await UserService.updateUser(
        req.params.id as string,
        updateBody,
      );
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

      // Check Authorization header first (for cross-domain), then fall back to signed cookies
      let token = req.headers.authorization;
      if (!token || !token.startsWith('Bearer ')) {
        token = req.signedCookies.Authorization;
      }
      
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
      
      const verified = await UserService.getUserByToken(token as string);
      if (!verified) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
      const updated = await UserService.updateUser(
        verified.id.toString(),
        updateBody,
      );
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json(updated);
    } catch (error: any) {
      next(error);
    }
  }
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await UserService.deleteUser(req.params.id as string);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      if (deleted === "Cannot delete admin") {
        return res.status(403).json({ message: "Cannot delete admin user" });
      }
      return res.status(200).json({ message: "User deleted successfully", user: deleted });
    } catch (error: any) {
      next(error);
    }
  }
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
      req.body.role = "student";
      const created = await UserService.createUser(
        registerSchema.parse(req.body),
      );
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
        return res
          .status(401)
          .json({ message: "Password or email is incorrect" });
      }
      const token = await UserService.generateToken({ id_: p._id });
      res.cookie("Authorization", `Bearer ${token}`, {
        expires: new Date(Date.now() + 3600000),
        httpOnly: true,
        sameSite: "none",
        secure:true,
        signed: true,
      });

      return res.status(200).json({ token: token });
    } catch (error: any) {
      next(error);
    }
  }
  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { credential } = googleLoginSchema.parse(req.body);
      const user = await UserService.googleLogin(credential);

      const token = await UserService.generateToken({ id_: user._id });
      res.cookie("Authorization", `Bearer ${token}`, {
        expires: new Date(Date.now() + 3600000),
        httpOnly: true,
                secure:true,
        sameSite: "none",
        signed: true,
      });

      return res.status(200).json({ token });
    } catch (error: any) {
      next(error);
    }
  }
  async getUserInfo(req: Request, res: Response, next: NextFunction) {
    try {
      // Check Authorization header first (for cross-domain), then fall back to signed cookies
      let token = req.headers.authorization;
      if (!token || !token.startsWith('Bearer ')) {
        token = req.signedCookies.Authorization;
      }
      
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
      
      const verified = UserGetFromTokenSchema.parse(
        await UserService.getUserByToken(token as string),
      );
      console.log(verified);
      if (!verified) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
      return res.status(200).json({ user: verified });
    } catch (error: any) {
      next(error);
    }
  }
  async removeToken(_req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("Authorization");
      //the token still valid until it expires, but client cannot send it anymore
      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error: any) {
      next(error);
    }
  }
  async findByKeyWord(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      // accept either `q` or `keyword` from client (frontend uses `keyword` in some places)
      const keyword =
        (req.query.q as string) || (req.query.keyword as string) || "";
      const results = await UserService.findByKeyWordForAdmin(keyword, page);
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
        role as string,
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
