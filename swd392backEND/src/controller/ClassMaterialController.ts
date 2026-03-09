import type { NextFunction, Request, Response } from "express";
import ClassMaterialService from "../services/ClassMaterialService.ts";
import {
    createClassMaterialSchema,
    updateClassMaterialSchema,
    reorderMaterialsSchema,
    toggleAiMaterialSchema,
} from "../dto/ClassMaterialDTO.ts";
import FileService from "../services/FileService.ts";
import QuizService from "../services/QuizService.ts";
import SlideService from "../services/SlideService.ts";

class ClassMaterialController {
    async getPendingMaterials(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const materials = await ClassMaterialService.getPendingMaterials(page);
            return res.status(200).json(materials);
        } catch (error) {
            next(error);
        }
    }
    // GET /api/class-materials?class_id=&page=
    async getMaterialsByClass(req: Request, res: Response, next: NextFunction) {
        try {
            const { class_id, page } = req.query;
            if (!class_id) {
                return res.status(400).json({ message: "class_id is required" });
            }
            const pageNum = parseInt(page as string) || 1;
            const materials = await ClassMaterialService.getClassMaterialsByClass(class_id as string, pageNum);
            return res.status(200).json(materials);
        } catch (error) {
            next(error);
        }
    }

    // GET /api/class-materials/all?page=
    async getAllMaterials(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const materials = await ClassMaterialService.getAllClassMaterials(page);
            return res.status(200).json(materials);
        } catch (error) {
            next(error);
        }
    }

    // GET /api/class-materials/topic/:topicId
    async getMaterialsByTopic(req: Request, res: Response, next: NextFunction) {
        try {
            const { topicId } = req.params;
            const materials = await ClassMaterialService.getClassMaterialsByTopic(topicId as string);
            return res.status(200).json(materials);
        } catch (error) {
            next(error);
        }
    }

    // GET /api/class-materials/topic/:topicId/class/:classId
    async getMaterialByTopicAndClass(req: Request, res: Response, next: NextFunction) {
        try {
            const { topicId, classId } = req.params;
            const material = await ClassMaterialService.getClassMaterialByTopicAndClassId(topicId as string, classId as string);
            if (!material) {
                return res.status(404).json({ message: "Class material not found" });
            }
            return res.status(200).json(material);
        } catch (error) {
            next(error);
        }
    }

    // GET /api/class-materials/:id
    async getMaterialById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await ClassMaterialService.getClassMaterialById(id as string);

            if (!result) {
                return res.status(404).json({ message: "Class material not found" });
            }

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // POST /api/class-materials
    async createMaterial(req: Request, res: Response, next: NextFunction) {
        try {

            const { materialData, content_id } = req.body;

            if (!content_id) {
                return res.status(400).json({ message: "content_id is required" });
            }

            const parsedMaterialData = createClassMaterialSchema.parse(materialData);

            let material: any = null;

            switch (parsedMaterialData.type) {
                case "file":
                    material = await FileService.getFileById(content_id as string);
                    break;
                case "quiz":
                    material = await QuizService.getQuizById(content_id as string);
                    break;
                case "slide":
                    material = await SlideService.getSlideById(content_id as string);
                    break;
                // case "2d_render":
                //     material = await TwoDRenderService.getTwoDRenderById(content_id as string);
                //     break;
            }

            if (!material) {
                return res.status(400).json({ message: "Failed to create material content" });
            }

            // Include content_id in the material data
            const dataToCreate = {
                ...parsedMaterialData,
                content_id: content_id,
            };

            const result = await ClassMaterialService.createClassMaterial(dataToCreate);
            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/class-materials/:id
    async updateMaterial(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const updateData = updateClassMaterialSchema.parse(req.body);

            // Backend handles timestamp logic
            const dataWithTimestamp = {
                ...updateData,
                dateUpdate: new Date(),
            };

            const result = await ClassMaterialService.updateClassMaterial(id as string, dataWithTimestamp);
            if (!result) {
                return res.status(404).json({ message: "Class material not found" });
            }
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/class-materials/:id
    async deleteMaterial(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const result = await ClassMaterialService.deleteClassMaterial(id as string);
            if (!result) {
                return res.status(404).json({ message: "Class material not found" });
            }
            return res.status(200).json({ message: "Class material deleted successfully", data: result });
        } catch (error) {
            next(error);
        }
    }

    // PATCH /api/class-materials/reorder
    async reorderMaterials(req: Request, res: Response, next: NextFunction) {
        try {
            const { class_id, material_ids } = reorderMaterialsSchema.parse(req.body);
            const result = await ClassMaterialService.updateOrderNumbers(class_id, material_ids);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // PATCH /api/class-materials/:id/toggle-ai
    async toggleAiMaterial(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { ai_content_id } = toggleAiMaterialSchema.parse(req.body);
            const result = await ClassMaterialService.toggleAiMaterial(id as string, ai_content_id);
            if ((result as any)?.error) {
                return res.status(404).json({ message: (result as any).error });
            }
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // GET /api/class-materials/count?class_id=
    async getMaterialCount(req: Request, res: Response, next: NextFunction) {
        try {
            const { class_id } = req.query;
            if (!class_id) {
                return res.status(400).json({ message: "class_id is required" });
            }
            const count = await ClassMaterialService.getClassMaterialCount(class_id as string);
            return res.status(200).json({ count });
        } catch (error) {
            next(error);
        }
    }

    // // PATCH /api/class-materials/:id/flag
    // async flagMaterial(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const { id } = req.params;
    //         const result = await ClassMaterialService.flagMaterial(id as string);
    //         if ((result as any)?.error) {
    //             return res.status(400).json({ message: (result as any).error });
    //         }
    //         return res.status(200).json(result);
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // // PATCH /api/class-materials/:id/status
    // async changeStatus(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const { id } = req.params;
    //         const { status } = req.body;
    //         if (!status) {
    //             return res.status(400).json({ message: "status is required" });
    //         }
    //         const result = await ClassMaterialService.toggleClassMaterialStatus(id as string, status);
    //         if ((result as any)?.error) {
    //             return res.status(400).json({ message: (result as any).error });
    //         }
    //         return res.status(200).json(result);
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // // PATCH /api/class-materials/:id/verify
    // async verifyAfterFlag(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const { id } = req.params;
    //         const result = await ClassMaterialService.verifyAfterFlag(id as string);
    //         if ((result as any)?.error) {
    //             return res.status(400).json({ message: (result as any).error });
    //         }
    //         return res.status(200).json(result);
    //     } catch (error) {
    //         next(error);
    //     }
    // }
}

export default new ClassMaterialController();
