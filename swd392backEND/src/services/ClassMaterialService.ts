import ClassMaterialRepo from "../repository/ClassMaterialRepo.ts";
import type { CreateClassMaterialDTO, UpdateClassMaterialDTO } from "../dto/ClassMaterialDTO.ts";
import FileRepo from "../repository/FileRepo.ts";
import QuizRepo from "../repository/QuizRepo.ts";
import SlideRepo from "../repository/SlideRepo.ts";
import Render2DRepo from "../repository/Render2DRepo.ts";

class ClassMaterialService {
    async getClassMaterialById(id: string) {
        const material = await ClassMaterialRepo.getClassMaterialById(id);
        if (!material) {
            return { error: "Class material not found" };
        }

        if (!material.content_id) {
            return { success: true, data: material };
        }

        let populatedContent = null;
        switch (material.type) {
            case 'file':
                populatedContent = await FileRepo.getFileById(material.content_id.toString());
                break;
            case 'slide':
                populatedContent = await SlideRepo.getSlideById(material.content_id.toString());
                break;
            case 'quiz':
                populatedContent = await QuizRepo.getQuizById(material.content_id.toString());
                break;
            case '2d_render':
                populatedContent = await Render2DRepo.getRender2DById(material.content_id.toString());
                break;
        }

        return {
            success: true,
            data: {
                ...material.toObject(),
                content: populatedContent
            }
        };
    }

    async getClassMaterialWithContent(id: string) {
        const material = await ClassMaterialRepo.getClassMaterialById(id);
        if (!material) {
            return { error: "Class material not found" };
        }

        if (!material.content_id) {
            return { success: true, data: material };
        }

        let populatedContent = null;
        switch (material.type) {
            case 'file':
                populatedContent = await FileRepo.getFileById(material.content_id.toString());
                break;
            case 'slide':
                populatedContent = await SlideRepo.getSlideById(material.content_id.toString());
                break;
            case 'quiz':
                populatedContent = await QuizRepo.getQuizById(material.content_id.toString());
                break;
            case '2d_render':
                populatedContent = await Render2DRepo.getRender2DById(material.content_id.toString());
                break;
        }

        return {
            data: {
                ...material.toObject(),
                content: populatedContent
            }
        };
    }

    async getClassMaterialsByClass(classId: string, page: number = 1) {
        return await ClassMaterialRepo.getClassMaterialsByClass(classId, page);
    }

    async getClassMaterialsByTopic(topicId: string) {
        return await ClassMaterialRepo.getClassMaterialsByTopic(topicId);
    }

    async getClassMaterialByTopicAndClassId(topicId: string, classId: string) {
        return await ClassMaterialRepo.getClassMaterialByTopicAndClassId(topicId, classId);
    }

    async getClassMaterialsByType(classId: string, type: string) {
        return await ClassMaterialRepo.getClassMaterialsByType(classId, type);
    }

    async toggleClassMaterialStatus(id: string, status: string) {
        const material = await ClassMaterialRepo.getClassMaterialById(id);
        if (!material) {
            return { error: "Class material not found" };
        }
        if (status !== 'published' && status !== 'draft' && status !== 'reviewed' && status !== 'deleted') {
            return { error: "Invalid status value" };
        }

        material.status = status;
        const updatedMaterial = await material.save();
        return updatedMaterial;
    }
    async toggleClassMaterialFlaggable(id: string, isFlaggable: boolean) {
        const material = await ClassMaterialRepo.getClassMaterialById(id);
        if (!material) {
            return { error: "Class material not found" };
        }
        material.isFlaggable = isFlaggable;
        const updatedMaterial = await material.save();
        return updatedMaterial;
    }

    // Student flags a reviewed material for re-moderation
    async flagMaterial(id: string) {
        const material = await ClassMaterialRepo.getClassMaterialById(id);
        if (!material) return { error: "Class material not found" };
        if (material.status !== 'reviewed') return { error: "Only reviewed materials can be flagged" };
        if (!material.isFlaggable) return { error: "This material has already been verified and cannot be flagged" };
        if (material.isFlagged) return { error: "Material is already flagged" };

        material.isFlagged = true;
        material.status = 'published'; // back to moderator queue
        const updatedMaterial = await material.save();
        return { success: true, data: updatedMaterial };
    }

    // Moderator re-verifies after a student flag → fully verified, no more flags
    async verifyAfterFlag(id: string) {
        const material = await ClassMaterialRepo.getClassMaterialById(id);
        if (!material) return { error: "Class material not found" };
        if (!material.isFlagged) return { error: "Material is not currently flagged" };

        material.status = 'reviewed';
        material.isFlagged = false;
        material.isFlaggable = false;
        const updatedMaterial = await material.save();
        return { success: true, data: updatedMaterial };
    }

    // Moderator views published materials pending review
    async getPendingMaterials(page: number = 1) {

        return await ClassMaterialRepo.getPendingMaterials(page);
    }

    async getClassMaterialCount(classId: string) {
        return await ClassMaterialRepo.getClassMaterialCount(classId);
    }

    async updateOrderNumbers(classId: string, materialIds: string[]) {
        return await ClassMaterialRepo.updateOrderNumbers(classId, materialIds);
    }

    async toggleAiMaterial(id: string, aiContentId?: string) {
        const material = await ClassMaterialRepo.getClassMaterialById(id);
        if (!material) {
            return { error: "Class material not found" };
        }

        return await ClassMaterialRepo.toggleAiMaterial(id, aiContentId);
    }

    async getClassMaterialByUpload(page: number = 1) {
        return await ClassMaterialRepo.getAllClassMaterials(page).then(materials => {
            return materials.filter(material => material.type === 'file');
        });
    }

    async getClassMaterialQuiz(page: number = 1) {
        return await ClassMaterialRepo.getAllClassMaterials(page).then(materials => {
            return materials.filter(material => material.type === 'quiz');
        });
    }

    async getAllClassMaterials(page: number = 1) {
        return await ClassMaterialRepo.getAllClassMaterials(page);
    }

    async getClassMaterialsByTeacher(page: number = 1) {
        return await ClassMaterialRepo.getAllClassMaterials(page);
    }

    // New methods for class material type-specific operations with content
    async getClassMaterialsByTypeWithContent(classId: string, type: string, page: number = 1) {
        const materials = await ClassMaterialRepo.getClassMaterialsByType(classId, type);

        // Populate content for each material
        const materialsWithContent = await Promise.all(
            materials.map(async (material) => {
                if (!material.content_id) {
                    return material;
                }

                let populatedContent = null;
                switch (material.type) {
                    case 'file':
                        populatedContent = await FileRepo.getFileById(material.content_id.toString());
                        break;
                    case 'slide':
                        populatedContent = await SlideRepo.getSlideById(material.content_id.toString());
                        break;
                    case 'quiz':
                        populatedContent = await QuizRepo.getQuizById(material.content_id.toString());
                        break;
                    case '2d_render':
                        populatedContent = await Render2DRepo.getRender2DById(material.content_id.toString());
                        break;
                }

                return {
                    ...material.toObject(),
                    content: populatedContent
                };
            })
        );

        return materialsWithContent;
    }

    // Simple CRUD methods for class materials (without content management)
    async createClassMaterial(materialData: any) {
        // Get next order number if not provided
        if (!materialData.order_num && materialData.class_assign_id) {
            materialData.order_num = await ClassMaterialRepo.getNextOrderNumber(materialData.class_assign_id);
        }

        return await ClassMaterialRepo.createClassMaterial(materialData);
    }

    async updateClassMaterial(id: string, updateData: UpdateClassMaterialDTO) {
        return await ClassMaterialRepo.updateClassMaterial(id, updateData);
    }

    async deleteClassMaterial(id: string) {
        return await ClassMaterialRepo.deleteClassMaterial(id);
    }
}

export default new ClassMaterialService();