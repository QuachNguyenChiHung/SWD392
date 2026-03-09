import { ClassMaterial } from "../entities/ClassMaterial.ts";

class ClassMaterialRepo {
    async getClassMaterialById(id: string) {
        return await ClassMaterial.findById(id);
    }
    async getClassMaterialsByClass(classId: string, page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await ClassMaterial.find({ class_assign_id: classId })
            .sort({ order_num: 1 })
            .skip(skip)
            .limit(limit);
    }
    async getClassMaterialsByTopic(topicId: string) {
        return await ClassMaterial.find({ topic_id: topicId })
            .sort({ order_num: 1 });
    }
    async getClassMaterialByTopicAndClassId(topicId: string, classId: string) {
        return await ClassMaterial.find({
            topic_id: topicId,
            class_assign_id: classId
        }).sort({ order_num: 1 });
    }
    async getClassMaterialsByType(classId: string, type: string) {
        return await ClassMaterial.find({
            class_assign_id: classId,
            type: type
        }).sort({ order_num: 1 });
    }
    async createClassMaterial(materialData: any) {
        const newMaterial = new ClassMaterial(materialData);
        return await newMaterial.save();
    }
    async updateClassMaterial(id: string, updateData: any) {
        return await ClassMaterial.findByIdAndUpdate(id, updateData, { new: true });
    }
    async deleteClassMaterial(id: string) {
        return await ClassMaterial.findByIdAndDelete(id);
    }
    async getClassMaterialCount(classId: string) {
        return await ClassMaterial.countDocuments({ class_assign_id: classId });
    }
    async getActiveClassMaterialsByClass(classId: string) {
        return await ClassMaterial.find({
            class_assign_id: classId,
            status: { $nin: ['draft', 'deleted'] }
        }).sort({ order_num: 1 });
    }
    async getActiveClassMaterialCount(classId: string) {
        return await ClassMaterial.countDocuments({
            class_assign_id: classId,
            status: { $nin: ['draft', 'deleted'] }
        });
    }
    async updateOrderNumbers(classId: string, materialIds: string[]) {
        const updatePromises = materialIds.map((id, index) =>
            ClassMaterial.findByIdAndUpdate(id, { order_num: index + 1 })
        );
        return await Promise.all(updatePromises);
    }
    async getNextOrderNumber(classId: string) {
        const lastMaterial = await ClassMaterial.findOne({ class_assign_id: classId })
            .sort({ order_num: -1 })
            .limit(1);
        return lastMaterial ? lastMaterial.order_num + 1 : 1;
    }
    async getClassMaterialByUpload(page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await ClassMaterial.find({ type: 'file' })
            .sort({ dateCreate: -1 })
            .skip(skip)
            .limit(limit);
    }
    async getClassMaterialQuiz(page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await ClassMaterial.find({ type: 'quiz' })
            .sort({ dateCreate: -1 })
            .skip(skip)
            .limit(limit);
    }
    async getAllClassMaterials(page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await ClassMaterial.find()
            .sort({ dateCreate: -1 })
            .skip(skip)
            .limit(limit);
    }
    async getClassMaterialsByTeacher(teacherId: string, page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await ClassMaterial.find({ teacher_id: teacherId })
            .sort({ dateCreate: -1 })
            .skip(skip)
            .limit(limit);
    }
    // Returns published materials (first-time or re-flagged) for moderator review
    async getPendingMaterials(page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await ClassMaterial.find({ status: 'published' })
            .sort({ isFlagged: -1, dateCreate: -1 })
            .skip(skip)
            .limit(limit);
    }
    async toggleAiMaterial(id: string, aiContentId?: string) {
        const material = await ClassMaterial.findById(id);
        if (material) {
            const updateData: any = {
                is_ai_material: !material.is_ai_material
            };

            if (!material.is_ai_material && aiContentId) {
                updateData.ai_content_id = aiContentId;
            } else {
                updateData.ai_content_id = null;
            }

            return await ClassMaterial.findByIdAndUpdate(id, updateData, { new: true });
        }
        return null;
    }
}
export default new ClassMaterialRepo;