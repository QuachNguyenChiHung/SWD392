import SlideRepo from "../repository/SlideRepo.ts";
import type { CreateSlideDTO, UpdateSlideDTO } from "../dto/SlideDTO.ts";

class SlideService {
    async getSlideById(id: string) {
        return await SlideRepo.getSlideById(id);
    }

    async getAllSlides(page: number = 1) {
        return await SlideRepo.getAllSlides(page);
    }

    async createSlide(slideData: CreateSlideDTO) {
        return await SlideRepo.createSlide(slideData);
    }

    async updateSlide(id: string, updateData: UpdateSlideDTO) {
        return await SlideRepo.updateSlide(id, updateData);
    }

    async deleteSlide(id: string) {
        return await SlideRepo.deleteSlide(id);
    }

    async findByPath(filePath: string) {
        return await SlideRepo.findByPath(filePath);
    }
}

export default new SlideService();