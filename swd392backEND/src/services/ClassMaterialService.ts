import ClassMaterialRepo from "../repository/ClassMaterialRepo.ts";
import type { CreateClassMaterialDTO, UpdateClassMaterialDTO } from "../dto/ClassMaterialDTO.ts";
import type { IClassMaterial } from "../interface/IClassMaterial";
import ProgressClassMaterialService from "./ProgressClassMaterialService.ts";

class ClassMaterialService {
    async getClassMaterialById(id: string) {
        const material = await ClassMaterialRepo.getClassMaterialById(id);
        if (!material) {
            return null;
        }
        return material;
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

    async getClassMaterialsFilesByTeacher(teacherId: string) {
        const files = ['file', 'slide', '2d_render'];
        const result = await ClassMaterialRepo.getClassMaterialsByTeacher(teacherId);
        return result.filter((material: IClassMaterial) => files.includes(material.type));
    }

    async getClassMaterialsQuizByTeacher(teacherId: string) {
        const files = ['quiz'];
        const result = await ClassMaterialRepo.getClassMaterialsByTeacher(teacherId);
        return result.filter((material: IClassMaterial) => files.includes(material.type));
    }

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
        return await ClassMaterialRepo.toggleAiMaterial(id, aiContentId);
    }

    async getClassMaterialByUpload(page: number = 1) {
        return await ClassMaterialRepo.getClassMaterialByUpload(page);
    }

    async getClassMaterialQuiz(page: number = 1) {
        return await ClassMaterialRepo.getClassMaterialQuiz(page);
    }

    async getAllClassMaterials(page: number = 1) {
        return await ClassMaterialRepo.getAllClassMaterials(page);
    }



    async createClassMaterial(materialData: any) {
        const result = await ClassMaterialRepo.createClassMaterial(materialData);

        // Eager: if material is active (not draft/deleted), create progress for all enrolled students
        if (result && !['draft', 'deleted'].includes(result.status)) {
            await ProgressClassMaterialService.bulkCreateForMaterial(
                result._id.toString(),
                result.class_assign_id.toString()
            );
        }

        return result;
    }

    async updateClassMaterial(id: string, updateData: UpdateClassMaterialDTO) {
        // Reset properties if a material is updated
        updateData.status = 'published';
        updateData.isFlagged = false;
        updateData.isFlaggable = true;

        const previous = await ClassMaterialRepo.getClassMaterialById(id);
        const result = await ClassMaterialRepo.updateClassMaterial(id, updateData);

        if (result && updateData.status) {
            const wasActive = previous && !['draft', 'deleted'].includes(previous.status);
            const isActive = !['draft', 'deleted'].includes(updateData.status);

            if (!wasActive && isActive) {
                // Material became active: create progress for all enrolled students
                await ProgressClassMaterialService.bulkCreateForMaterial(
                    result._id.toString(),
                    result.class_assign_id.toString()
                );
            } else if (wasActive && !isActive) {
                // Material became inactive: delete all progress for this material
                await ProgressClassMaterialService.bulkDeleteForMaterial(result._id.toString());
            }
        }

        return result;
    }

    async deleteClassMaterial(id: string) {
        // Eager: delete all progress records for this material before deleting it
        await ProgressClassMaterialService.bulkDeleteForMaterial(id);
        return await ClassMaterialRepo.deleteClassMaterial(id);
    }

    async flagMaterial(id: string) {
        const material = await ClassMaterialRepo.getClassMaterialById(id);
        if (!material) return { error: "Class material not found" };

        if (material.status !== 'published') {
            return { error: "Only published materials can be flagged" };
        }
        if (!material.isFlaggable) {
            return { error: "This material cannot be flagged again" };
        }

        return await ClassMaterialRepo.updateClassMaterial(id, {
            isFlagged: true
        });
    }

    async toggleClassMaterialStatus(id: string, status: string) {
        const validStatuses = ['published', 'draft', 'reviewed', 'deleted'];
        if (!validStatuses.includes(status)) {
            return { error: "Invalid status" };
        }

        const material = await ClassMaterialRepo.getClassMaterialById(id);
        if (!material) return { error: "Class material not found" };

        const updateData: any = { status, isFlagged: false };
        if (status === 'reviewed') {
            updateData.isFlaggable = false;
        }

        return await ClassMaterialRepo.updateClassMaterial(id, updateData);
    }

    async verifyAfterFlag(id: string) {
        const material = await ClassMaterialRepo.getClassMaterialById(id);
        if (!material) return { error: "Class material not found" };

        return await ClassMaterialRepo.updateClassMaterial(id, {
            status: 'reviewed',
            isFlagged: false,
            isFlaggable: false
        });
    }


}

export default new ClassMaterialService();