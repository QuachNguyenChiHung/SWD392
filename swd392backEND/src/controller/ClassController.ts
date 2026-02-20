

import type { NextFunction, Request, Response } from "express";
import ClassService from "../services/ClassService.ts";
import { createClassSchema, updateClassSchema } from "../dto/ClassDTO.ts";
import { deleteImage, updateImage, uploadImage } from "../ultis/cloudinary.ts";

class ClassController {
    async getClassById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const classObj = await ClassService.getClassById(id as string);
            if (classObj) {
                return res.status(200).json(classObj);
            }
            return res.status(404).json({ message: "Class not found" });
        } catch (error) {
            next(error);
        }
    }

    async getClassesByTeacher(req: Request, res: Response, next: NextFunction) {
        try {
            const u_id = req.user?.id;
            const page = parseInt(req.query.page as string) || 1;
            const classes = await ClassService.getClassesByTeacher(u_id as string, page);
            return res.status(200).json(classes);
        } catch (error) {
            next(error);
        }
    }
    async getClassesByStudent(req: Request, res: Response, next: NextFunction) {
        try {
            const u_id = req.user?.id;
            const page = parseInt(req.query.page as string) || 1;
            const classes = await ClassService.getClassesByStudent(u_id as string, page);
            return res.status(200).json(classes);
        } catch (error) {
            next(error);
        }
    }
    async createClass(req: Request, res: Response, next: NextFunction) {
        try {
            req.body.teacher_id = req.user?.id;
            const classData = createClassSchema.parse(req.body);
            const newClass = await ClassService.createClass(classData);
            return res.status(201).json(newClass);
        } catch (error) {
            next(error);
        }
    }
    async uploadImageCover(req: Request, res: Response, next: NextFunction) {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).json({ message: "No file uploaded" });
            }
            const imageUrl = await uploadImage(file?.buffer);
            return res.status(200).json({ url: imageUrl });
        } catch (error) {
            next(error);
        }
    }
    async updateImageCover(req: Request, res: Response, next: NextFunction) {
        try {
            const file = req.file;
            const { url } = req.body;
            if (!file) {
                return res.status(400).json({ message: "No file uploaded" });
            }
            const ownerCheck = await ClassService.verifyImageOwnership(url, req.user?.id as string);
            if (ownerCheck?.error) {
                return res.status(403).json(ownerCheck);
            }
            const imageUrl = await updateImage(url, file?.buffer);
            // update class record with new image url
            const updated = await ClassService.updateClassImage(url, imageUrl, req.user?.id as string);
            if ((updated as any)?.error) {
                return res.status(403).json(updated);
            }
            return res.status(200).json({ url: imageUrl });
        } catch (error) {
            next(error);
        }
    }
    async deleteImageCover(req: Request, res: Response, next: NextFunction) {
        try {
            const { url } = req.body;
            const ownerCheck = await ClassService.verifyImageOwnership(url, req.user?.id as string);
            if (ownerCheck?.error) {
                return res.status(403).json(ownerCheck);
            }
            await deleteImage(url);
            // clear image url from class record
            const cleared = await ClassService.clearClassImage(url, req.user?.id as string);
            if ((cleared as any)?.error) {
                return res.status(403).json(cleared);
            }
            return res.status(200).json({ message: "Image deleted successfully" });
        } catch (error) {
            next(error);
        }
    }
    async updateClass(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const updateData = updateClassSchema.parse(req.body);
            const teacherUserId = req.user?.id;
            const updatedClass = await ClassService.updateClass(id as string, updateData, teacherUserId as string);
            if ((updatedClass as any).error) {
                return res.status(403).json(updatedClass);
            }
            if (!updatedClass) {
                return res.status(404).json({ message: "Class not found" });
            }
            return res.status(200).json(updatedClass);
        } catch (error) {
            next(error);
        }
    }
}
export default new ClassController;