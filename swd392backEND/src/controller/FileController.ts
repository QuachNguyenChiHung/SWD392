import type { NextFunction, Request, Response } from "express";
import FileService from "../services/FileService.ts";
import { createFileSchema, updateFileSchema } from "../dto/FileDTO.ts";

class FileController {
    async getAllFiles(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const files = await FileService.getAllFiles(page);
            return res.status(200).json(files);
        } catch (error) {
            next(error);
        }
    }

    async getFileById(req: Request, res: Response, next: NextFunction) {
        try {
            const file = await FileService.getFileById(req.params.id as string);
            if (!file) {
                return res.status(404).json({ message: "File not found" });
            }
            return res.status(200).json(file);
        } catch (error) {
            next(error);
        }
    }

    async createFile(req: Request, res: Response, next: NextFunction) {
        try {
            const fileData = createFileSchema.parse(req.body);
            const created = await FileService.createFile(fileData);
            return res.status(201).json(created);
        } catch (error) {
            next(error);
        }
    }

    async updateFile(req: Request, res: Response, next: NextFunction) {
        try {
            const updateData = updateFileSchema.parse(req.body);
            const updated = await FileService.updateFile(req.params.id as string, updateData);
            if (!updated) {
                return res.status(404).json({ message: "File not found" });
            }
            return res.status(200).json(updated);
        } catch (error) {
            next(error);
        }
    }

    async deleteFile(req: Request, res: Response, next: NextFunction) {
        try {
            const deleted = await FileService.deleteFile(req.params.id as string);
            if (!deleted) {
                return res.status(404).json({ message: "File not found" });
            }
            return res.status(200).json({ message: "File deleted successfully" });
        } catch (error) {
            next(error);
        }
    }

    async findByPath(req: Request, res: Response, next: NextFunction) {
        try {
            const { path } = req.query;
            if (!path) {
                return res.status(400).json({ message: "path query parameter is required" });
            }
            const file = await FileService.findByPath(path as string);
            if (!file) {
                return res.status(404).json({ message: "File not found" });
            }
            return res.status(200).json(file);
        } catch (error) {
            next(error);
        }
    }
}

export default new FileController();
