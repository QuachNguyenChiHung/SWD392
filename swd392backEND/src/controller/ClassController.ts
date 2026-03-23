

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
    async getClassesByName(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, page } = req.query;
            const classObj = await ClassService.searchClassesByName(name as string, parseInt(page as string));
            if (!classObj || classObj.length === 0) {
                return res.status(404).json({ message: "No classes found" });
            }


            const cleaned = classObj.map((cls) => {
                const { keypass, ...rest } = cls.toObject();
                return rest;
            });
            return res.status(200).json(cleaned);


        } catch (error) {
            next(error);
        }
    }
    /**
     * DELETE /classes/:id (Teachers only - with ownership verification)
     * 
     * Cascade deletes a class and all related data including:
     * - Class materials (file, slide, quiz, render2d)
     * - Enrollments
     * - Feedback
     * - Files
     * - Progress records
     * - Questions
     * - Quizzes
     * - Quiz attempts
     * - Results
     * - Render2D objects
     * - Slides
     * 
     * @route DELETE /classes/:id
     * @middleware verifyTeacher - Ensures authenticated teacher
     * @param {Request} req - Express request object with class ID in params
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next middleware function
     * @returns {Promise<Response>} JSON response with deletion results
     * 
     * @response 200 - Success with deletion counts
     * @response 403 - Forbidden (not class owner or not teacher)
     * @response 404 - Class not found
     * @response 500 - Server error (transaction failed)
     * 
     * @example
     * // Success response:
     * {
     *   "success": true,
     *   "message": "Class deleted successfully",
     *   "deletedCounts": {
     *     "classes": 1,
     *     "classMaterials": 5,
     *     "enrolls": 10,
     *     "feedback": 3,
     *     "files": 2,
     *     "progressClassMaterial": 50,
     *     "questions": 15,
     *     "quizzes": 3,
     *     "quizAttempts": 25,
     *     "render2d": 1,
     *     "results": 75,
     *     "slides": 2
     *   }
     * }
     */
    async deleteClass(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const teacherId = req.teacher?._id?.toString();

            if (!teacherId) {
                return res.status(403).json({
                    success: false,
                    error: "Not allowed",
                    result: null
                });
            }

            const result = await ClassService.deleteClassCascade(id as string, teacherId);

            if (!result.success) {
                if (result.error === "Class not found") {
                    return res.status(404).json(result);
                }
                if (result.error === "Not allowed") {
                    return res.status(403).json(result);
                }
                return res.status(500).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /admin/classes/:id (Admins only - no ownership check)
     * 
     * Admin endpoint to cascade delete any class regardless of ownership.
     * Deletes all related data including:
     * - Class materials (file, slide, quiz, render2d)
     * - Enrollments
     * - Feedback
     * - Files
     * - Progress records
     * - Questions
     * - Quizzes
     * - Quiz attempts
     * - Results
     * - Render2D objects
     * - Slides
     * 
     * @route DELETE /admin/classes/:id
     * @middleware verifyAdmin - Ensures authenticated admin
     * @param {Request} req - Express request object with class ID in params
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next middleware function
     * @returns {Promise<Response>} JSON response with deletion results
     * 
     * @response 200 - Success with deletion counts
     * @response 403 - Forbidden (not admin)
     * @response 404 - Class not found
     * @response 500 - Server error (transaction failed)
     * 
     * @example
     * // Success response:
     * {
     *   "success": true,
     *   "message": "Class deleted successfully",
     *   "deletedCounts": {
     *     "classes": 1,
     *     "classMaterials": 5,
     *     "enrolls": 10,
     *     "feedback": 3,
     *     "files": 2,
     *     "progressClassMaterial": 50,
     *     "questions": 15,
     *     "quizzes": 3,
     *     "quizAttempts": 25,
     *     "render2d": 1,
     *     "results": 75,
     *     "slides": 2
     *   }
     * }
     */
    async deleteClassForAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            // Admin can delete any class, so no teacherId check
            const result = await ClassService.deleteClassCascade(id as string);

            if (!result.success) {
                if (result.error === "Class not found") {
                    return res.status(404).json(result);
                }
                return res.status(500).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getClassesByTeacher(req: Request, res: Response, next: NextFunction) {
        try {
            const teacher_id = req.teacher?._id?.toString();
            const page = parseInt(req.query.page as string) || 1;
            const viewHiddenQuery = req.query.view_hidden as string | undefined;
            const viewHidden =
                viewHiddenQuery === undefined
                    ? true
                    : !["false", "0", "no"].includes(viewHiddenQuery.toLowerCase());
            const classes = await ClassService.getClassesByTeacher(teacher_id as string, page, viewHidden);
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
            req.body.teacher_id = req.teacher?._id.toString();
            req.body.keypass = Date.now();
            const classData = createClassSchema.parse(req.body);
            const newClass = await ClassService.createClass(classData);
            return res.status(201).json(newClass);
        } catch (error) {
            next(error);
        }
    }
    async getStudentsByClass(req: Request, res: Response, next: NextFunction) {
        try {
            // GET /api/class/:classId/students?page=1&keyword=temp
            const classId = req.params.classId as string;
            const page = parseInt(req.query.page as string) || 1;
            const keyword = req.query.keyword as string || "";
            const students = await ClassService.getStudentsByClass(classId, page, keyword);
            return res.status(200).json(students);
        } catch (error) {
            next(error);
        }
    }
    async generateKeypass(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId } = req.params;
            const keypass = await ClassService.generateKeypass(classId as string);
            if ((keypass as any)?.error) {
                return res.status(404).json(keypass);
            }
            return res.status(200).json({ keypass });
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
            const ownerCheck = await ClassService.verifyImageOwnership(url, req.teacher?._id?.toString() as string);
            if (ownerCheck?.error) {
                return res.status(403).json(ownerCheck);
            }
            const imageUrl = await updateImage(url, file?.buffer);
            // update class record with new image url
            const updated = await ClassService.updateClassImage(url, imageUrl, req.teacher?._id?.toString() as string);
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
            const ownerCheck = await ClassService.verifyImageOwnership(url, req.teacher?._id?.toString() as string);
            if (ownerCheck?.error) {
                return res.status(403).json(ownerCheck);
            }
            await deleteImage(url);
            // clear image url from class record
            const cleared = await ClassService.clearClassImage(url, req.teacher?._id?.toString() as string);
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
            delete (updateData as any).course_id; // Prevent updating course_id
            const teacher_id = req.teacher?._id?.toString();
            const updatedClass = await ClassService.updateClass(id as string, updateData, teacher_id as string);
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

    async getAdminClassStats(req: Request, res: Response, next: NextFunction) {
        try {
            const { timeRange, status } = req.query;
            const result = await ClassService.getAdminClassStats(
                timeRange as string,
                status as string
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
export default new ClassController;