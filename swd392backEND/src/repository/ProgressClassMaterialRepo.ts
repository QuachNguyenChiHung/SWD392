import { ProgressClassMaterial } from "../entities/ProgressClassMaterial.ts";

class ProgressClassMaterialRepo {
    async getById(id: string) {
        return await ProgressClassMaterial.findById(id);
    }
    async getByEnrollId(enrollId: string) {
        return await ProgressClassMaterial.find({ enroll_id: enrollId });
    }
    async getByClassMaterialId(classMaterialId: string) {
        return await ProgressClassMaterial.find({ classmaterial_id: classMaterialId });
    }
    async getByEnrollAndMaterial(enrollId: string, classMaterialId: string) {
        return await ProgressClassMaterial.findOne({ enroll_id: enrollId, classmaterial_id: classMaterialId });
    }
    async create(data: any) {
        const progress = new ProgressClassMaterial(data);
        return await progress.save();
    }
    async updateCompletionStatus(id: string, status: string) {
        return await ProgressClassMaterial.findByIdAndUpdate(
            id,
            { completion_status: status, date_completed: status === "completed" ? new Date() : null },
            { new: true }
        );
    }
    async deleteById(id: string) {
        return await ProgressClassMaterial.findByIdAndDelete(id);
    }
    async deleteByEnrollId(enrollId: string) {
        return await ProgressClassMaterial.deleteMany({ enroll_id: enrollId });
    }
    async deleteByClassMaterialId(classMaterialId: string) {
        return await ProgressClassMaterial.deleteMany({ classmaterial_id: classMaterialId });
    }
    async deleteByMaterialIds(enrollId: string, materialIds: string[]) {
        return await ProgressClassMaterial.deleteMany({
            enroll_id: enrollId,
            classmaterial_id: { $in: materialIds }
        });
    }
}

export default new ProgressClassMaterialRepo;
