import ClassMaterialRepo from "../repository/ClassMaterialRepo.ts";
import type { CreateClassMaterialDTO, UpdateClassMaterialDTO } from "../dto/ClassMaterialDTO.ts";
import type { IClassMaterial } from "../interface/IClassMaterial";

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

    async getClassMaterialsByClass(classId: string, page: number = 1) {
        return await ClassMaterialRepo.getClassMaterialsByClass(classId, page);
    }

    async getClassMaterialsByTopic(topicId: string) {
        return await ClassMaterialRepo.getClassMaterialsByTopic(topicId);
    }

    async getClassMaterialByTopicAndClassId(topicId: string, classId: string, page: number = 1) {
        const materials = await ClassMaterialRepo.getClassMaterialsByClass(classId, page);
        return materials.filter((mat: IClassMaterial) => mat.topic_id && mat.topic_id.toString() === topicId);
    }

    async getClassMaterialsByType(classId: string, type: string) {
        return await ClassMaterialRepo.getClassMaterialsByType(classId, type);
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

    async getClassMaterialsByTeacher(teacherId: string, page: number = 1) {
        return await ClassMaterialRepo.getClassMaterialsByTeacher(teacherId, page);
    }


    async createClassMaterial(materialData: any) {
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