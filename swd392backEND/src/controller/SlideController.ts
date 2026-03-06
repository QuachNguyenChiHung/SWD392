import type { NextFunction, Request, Response } from "express";
import SlideService from "../services/SlideService.ts";
import { createSlideSchema, updateSlideSchema } from "../dto/SlideDTO.ts";
import { updateFile, uploadFile } from "../ultis/cloudinary.ts";

class SlideController {
    async getAllSlides(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const slides = await SlideService.getAllSlides(page);
            return res.status(200).json(slides);
        } catch (error) {
            next(error);
        }
    }

    async getSlideById(req: Request, res: Response, next: NextFunction) {
        try {
            const slide = await SlideService.getSlideById(req.params.id as string);
            if (!slide) {
                return res.status(404).json({ message: "Slide not found" });
            }
            return res.status(200).json(slide);
        } catch (error) {
            next(error);
        }
    }

    async createSlide(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "File is required" });
            }
            const fileLink = await uploadFile(req.file?.buffer, req.file?.originalname || 'file');
            const body = {
                slide_name: req.file?.originalname || 'file',
                file_path: fileLink
            }
            const slideData = createSlideSchema.parse(body);
            const created = await SlideService.createSlide(slideData);
            return res.status(201).json(created);
        } catch (error) {
            next(error);
        }
    }

    async updateSlide(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                console.error('No file uploaded');
                return res.status(400).json({ message: "File is required" });
            }
            const slideEntity = await SlideService.getSlideById(req.params.id as string);
            if (!slideEntity) {
                return res.status(404).json({ message: "Slide not found" });
            }
            const p = await updateFile(slideEntity.file_path, req.file?.buffer, req.file?.originalname || 'file');
            const body = {
                slide_name: req.file?.originalname || 'file',
                file_path: p
            }
            const updateData = updateSlideSchema.parse(body);
            const updated = await SlideService.updateSlide(req.params.id as string, updateData);
            if (!updated) {
                return res.status(404).json({ message: "Slide not found" });
            }
            return res.status(200).json(updated);
        } catch (error) {
            next(error);
        }
    }

    async deleteSlide(req: Request, res: Response, next: NextFunction) {
        try {
            const deleted = await SlideService.deleteSlide(req.params.id as string);
            if (!deleted) {
                return res.status(404).json({ message: "Slide not found" });
            }
            return res.status(200).json({ message: "Slide deleted successfully" });
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
            const slide = await SlideService.findByPath(path as string);
            if (!slide) {
                return res.status(404).json({ message: "Slide not found" });
            }
            return res.status(200).json(slide);
        } catch (error) {
            next(error);
        }
    }
}

export default new SlideController();
