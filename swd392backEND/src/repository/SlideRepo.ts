import type { CreateSlideDTO } from "../dto/SlideDTO";
import { Slide } from "../entities/Slide.ts";

class SlideRepo {
    async getSlideById(id: string) {
        return await Slide.findById(id);
    }
    async getAllSlides(page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await Slide.find()
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);
    }
    async createSlide(slideData: CreateSlideDTO) {
        const newSlide = new Slide(slideData);
        return await newSlide.save();
    }
    async updateSlide(id: string, updateData: any) {
        return await Slide.findByIdAndUpdate(id, updateData, { new: true });
    }
    async deleteSlide(id: string) {
        return await Slide.findByIdAndDelete(id);
    }
    async findByPath(filePath: string) {
        return await Slide.findOne({ file_path: filePath });
    }
}
export default new SlideRepo;