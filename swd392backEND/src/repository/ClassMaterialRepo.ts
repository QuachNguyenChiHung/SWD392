import { ClassMaterial } from "../entities/ClassMaterial.ts";

class ClassMaterialRepo {
    async getClassMaterialById(id: string) {
        return await ClassMaterial.findById(id);
    }
    async getClassMaterialsByClass(classId: string, page: number, teacherId?: string) {
        const limit = 12;
        const skip = (page - 1) * limit;
        let query: any = { class_assign_id: classId };
        
        if (teacherId) {
            // For teachers, verify they own the class
            return await ClassMaterial.find(query)
                .populate({
                    path: 'class_assign_id',
                    match: { teacher_id: teacherId },
                    select: 'class_name teacher_id'
                })
                .sort({ order_num: 1 })
                .skip(skip)
                .limit(limit)
                .then(materials => materials.filter(material => material.class_assign_id));
        }
        
        // For admins, return all
        return await ClassMaterial.find(query)
            .populate('class_assign_id', 'class_name teacher_id')
            .sort({ order_num: 1 })
            .skip(skip)
            .limit(limit);
    }
    async getClassMaterialsByTopic(topicId: string, teacherId?: string) {
        if (teacherId) {
            // For teachers, verify they own the classes
            return await ClassMaterial.find({ topic_id: topicId })
                .populate({
                    path: 'class_assign_id',
                    match: { teacher_id: teacherId },
                    select: 'class_name teacher_id'
                })
                .sort({ order_num: 1 })
                .then(materials => materials.filter(material => material.class_assign_id));
        }
        
        // For admins, return all
        return await ClassMaterial.find({ topic_id: topicId })
            .populate('class_assign_id', 'class_name teacher_id')
            .sort({ order_num: 1 });
    }
    async getClassMaterialByTopicAndClassId(topicId: string, classId: string) {
        return await ClassMaterial.find({ 
            topic_id: topicId,
            class_assign_id: classId 
        }).sort({ order_num: 1 });
    }
    async getClassMaterialsByType(classId: string, type: string, teacherId?: string) {
        let query: any = { 
            class_assign_id: classId, 
            type: type 
        };
        
        if (teacherId) {
            // For teachers, verify they own the class
            return await ClassMaterial.find(query)
                .populate({
                    path: 'class_assign_id',
                    match: { teacher_id: teacherId },
                    select: 'class_name teacher_id'
                })
                .sort({ order_num: 1 })
                .then(materials => materials.filter(material => material.class_assign_id));
        }
        
        // For admins, return all
        return await ClassMaterial.find(query)
            .populate('class_assign_id', 'class_name teacher_id')
            .sort({ order_num: 1 });
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
    async getClassMaterialByUpload(teacherId: string, page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await ClassMaterial.find({ type: 'file' })
            .populate({
                path: 'class_assign_id',
                match: { teacher_id: teacherId },
                select: 'class_name teacher_id'
            })
            .sort({ dateCreate: -1 })
            .skip(skip)
            .limit(limit);
    }
    async getClassMaterialQuiz(teacherId: string, page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await ClassMaterial.find({ type: 'quiz' })
            .populate({
                path: 'class_assign_id',
                match: { teacher_id: teacherId },
                select: 'class_name teacher_id'
            })
            .sort({ dateCreate: -1 })
            .skip(skip)
            .limit(limit);
    }
    async getAllClassMaterials(page: number, teacherId?: string) {
        const limit = 12;
        const skip = (page - 1) * limit;
        
        if (teacherId) {
            // For teachers, only return materials from their classes
            return await ClassMaterial.find()
                .populate({
                    path: 'class_assign_id',
                    match: { teacher_id: teacherId },
                    select: 'class_name teacher_id'
                })
                .sort({ dateCreate: -1 })
                .skip(skip)
                .limit(limit)
                .then(materials => materials.filter(material => material.class_assign_id));
        }
        
        // For admins, return all materials
        return await ClassMaterial.find()
            .populate('class_assign_id', 'class_name teacher_id')
            .sort({ dateCreate: -1 })
            .skip(skip)
            .limit(limit);
    }
    async getClassMaterialsByTeacher(teacherId: string, page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await ClassMaterial.find()
            .populate({
                path: 'class_assign_id',
                match: { teacher_id: teacherId },
                select: 'class_name teacher_id'
            })
            .sort({ dateCreate: -1 })
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