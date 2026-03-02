import ClassMaterialRepo from "../repository/ClassMaterialRepo.ts";
import type { CreateClassMaterialDTO, UpdateClassMaterialDTO } from "../dto/ClassMaterialDTO.ts";
import FileRepo from "../repository/FileRepo.ts";
import QuizRepo from "../repository/QuizRepo.ts";
import SlideRepo from "../repository/SlideRepo.ts";
import Render2DRepo from "../repository/Render2DRepo.ts";

class ClassMaterialService {
    async getClassMaterialById(id: string) {
        return await ClassMaterialRepo.getClassMaterialById(id);
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
        try {
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
        } catch (error) {
            console.error(`Error fetching ${material.type} content:`, error);
            return { success: true, data: material };
        }
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

    async createClassMaterialWithContent(class_id: string, topic_id: string, type: string, content_data: any) {
        try {
            // Validate content type
            const validTypes = ['file', 'slide', 'quiz', '2d_render'];
            if (!validTypes.includes(type)) {
                return { error: `Invalid content type: ${type}. Must be one of: ${validTypes.join(', ')}` };
            }

            // Validate content_data
            if (!content_data || Object.keys(content_data).length === 0) {
                return { error: "Content data is required" };
            }

            // Step 1: Create content based on type
            console.log(`Creating ${type} content with data:`, content_data);
            
            let content_id = null;
            let createdContent = null;
            
            switch (type) {
                case 'file':
                    createdContent = await FileRepo.createFile(content_data);
                    break;
                case 'slide':
                    createdContent = await SlideRepo.createSlide(content_data);
                    break;
                case 'quiz':
                    createdContent = await QuizRepo.createQuiz(content_data);
                    break;
                case '2d_render':
                    createdContent = await Render2DRepo.createRender2D(content_data);
                    break;
                default:
                    throw new Error(`Unsupported content type: ${type}`);
            }
            
            if (!createdContent) {
                throw new Error(`Failed to create ${type} content`);
            }
            
            content_id = createdContent._id;
            
            // Step 2: Get next order number for this class
            const order_num = await ClassMaterialRepo.getNextOrderNumber(class_id);
            
            // Step 3: Create class material
            const materialData = {
                topic_id: topic_id,
                type: type,
                order_num: order_num,
                class_assign_id: class_id,
                title: content_data.title || `${type} Material`,
                content_id: content_id,
                is_ai_material: false
            };
            
            const createdMaterial = await ClassMaterialRepo.createClassMaterial(materialData);
            return { success: true, data: createdMaterial };
        } catch (error) {
            console.error('Error in createClassMaterialWithContent:', error);
            return { 
                error: error instanceof Error ? error.message : "Failed to create class material with content"
            };
        }
    }

    async updateClassMaterial(id: string, updateData: UpdateClassMaterialDTO, content_data?: any) {
        try {
            const material = await ClassMaterialRepo.getClassMaterialById(id);
            if (!material) {
                return { error: "Class material not found" };
            }

            // If there's content data to update and the material has a content_id
            if (content_data && material.content_id) {
                const contentId = material.content_id.toString();
                
                switch (material.type) {
                    case 'file':
                        await FileRepo.updateFile(contentId, content_data);
                        break;
                    case 'slide':
                        await SlideRepo.updateSlide(contentId, content_data);
                        break;
                    case 'quiz':
                        await QuizRepo.updateQuiz(contentId, content_data);
                        break;
                    case '2d_render':
                        await Render2DRepo.updateRender2D(contentId, content_data);
                        break;
                }
            }

            // Update dateUpdate
            updateData.dateUpdate = new Date();

            const updatedMaterial = await ClassMaterialRepo.updateClassMaterial(id, updateData);
            return { success: true, data: updatedMaterial };
        } catch (error) {
            console.error('Error in updateClassMaterial:', error);
            return { 
                error: error instanceof Error ? error.message : "Failed to update class material"
            };
        }
    }

    async deleteClassMaterial(id: string) {
        try {
            const material = await ClassMaterialRepo.getClassMaterialById(id);
            if (!material) {
                return { error: "Class material not found" };
            }

            // Delete the associated content if it exists
            if (material.content_id) {
                const contentId = material.content_id.toString();
                
                try {
                    switch (material.type) {
                        case 'file':
                            await FileRepo.deleteFile(contentId);
                            break;
                        case 'slide':
                            await SlideRepo.deleteSlide(contentId);
                            break;
                        case 'quiz':
                            await QuizRepo.deleteQuiz(contentId);
                            break;
                        case '2d_render':
                            await Render2DRepo.deleteRender2D(contentId);
                            break;
                    }
                } catch (contentError) {
                    console.warn(`Failed to delete ${material.type} content with ID ${contentId}:`, contentError);
                    // Continue with material deletion even if content deletion fails
                }
            }

            const deletedMaterial = await ClassMaterialRepo.deleteClassMaterial(id);
            return { success: true, data: deletedMaterial };
        } catch (error) {
            console.error('Error in deleteClassMaterial:', error);
            return { 
                error: error instanceof Error ? error.message : "Failed to delete class material"
            };
        }
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
}

export default new ClassMaterialService();