import { apiService } from '../api';
import type { CreateClassMaterialDTO, UpdateClassMaterialDTO } from '../../types/teacherType';

const classMaterialApi = {
    // Public / authenticated reads (student + teacher)
    getMaterialsByClass: async (classId: string, page: number = 1) => {
        const response = await apiService.get(`/class-materials?class_id=${classId}&page=${page}`);
        return response;
    },

    getAllMaterials: async (page: number = 1) => {
        const response = await apiService.get(`/class-materials/all?page=${page}`);
        return response;
    },

    getMaterialCount: async (classId: string) => {
        const response = await apiService.get(`/class-materials/count?class_id=${classId}`);
        return response;
    },

    getMaterialsByTopic: async (topicId: string) => {
        const response = await apiService.get(`/class-materials/topic/${topicId}`);
        return response;
    },

    getMaterialByTopicAndClass: async (topicId: string, classId: string) => {
        const response = await apiService.get(`/class-materials/topic/${topicId}/class/${classId}`);
        return response;
    },

    getMaterialById: async (id: string) => {
        const response = await apiService.get(`/class-materials/${id}`);
        return response;
    },

    // Moderator queue: published materials awaiting review
    getPendingMaterials: async () => {
        const response = await apiService.get('/class-materials/moderator/pending');
        return response;
    },

    // Teacher-only writes
    createMaterial: async (materialData: CreateClassMaterialDTO, contentId?: string) => {
        const payload = {
            materialData,
            content_id: contentId
        };
        const response = await apiService.post('/class-materials', payload);
        return response;
    },

    updateMaterial: async (id: string, updateData: UpdateClassMaterialDTO) => {
        const response = await apiService.put(`/class-materials/${id}`, updateData);
        return response;
    },

    deleteMaterial: async (id: string) => {
        const response = await apiService.delete(`/class-materials/${id}`);
        return response;
    },

    reorderMaterials: async (classId: string, materialIds: string[]) => {
        const payload = {
            class_id: classId,
            material_ids: materialIds
        };
        const response = await apiService.patch('/class-materials/reorder', payload);
        return response;
    },

    toggleAiMaterial: async (id: string, aiContentId?: string) => {
        const payload = {
            ai_content_id: aiContentId
        };
        const response = await apiService.patch(`/class-materials/${id}/toggle-ai`, payload);
        return response;
    },

    // Additional utility methods
    getMaterialsByType: async (classId: string, type: 'file' | 'slide' | '2d_render' | 'quiz') => {
        const materials = await classMaterialApi.getMaterialsByClass(classId);
        return materials.filter((material: any) => material.type === type);
    },

    getFilesByClass: async (classId: string) => {
        return await classMaterialApi.getMaterialsByType(classId, 'file');
    },

    getSlidesByClass: async (classId: string) => {
        return await classMaterialApi.getMaterialsByType(classId, 'slide');
    },

    getQuizzesByClass: async (classId: string) => {
        return await classMaterialApi.getMaterialsByType(classId, 'quiz');
    },

    get2DRendersByClass: async (classId: string) => {
        return await classMaterialApi.getMaterialsByType(classId, '2d_render');
    }
};

export default classMaterialApi;
