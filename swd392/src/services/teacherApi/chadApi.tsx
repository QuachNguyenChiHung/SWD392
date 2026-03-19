
import { apiService } from "../api";

type ChatMessage = {
    content: string;
    sender: "user" | "assistant";
};

class ChadApi {
    async askClaude(prompt: string) {
        return await apiService.post('/claude', { prompt });
    }

    async getChadResponse(messages: ChatMessage[]) {
        const cleaned = messages.map(m => {
            return {
                content: m.content,
                sender: m.sender
            }
        })
        return await apiService.post('/teacher/ai-chad', { prompt: cleaned });
    }

    async createQuiz(topicTitle: string, topicDescription: string | undefined, count: number, mcCount: number, tfCount: number) {
        return await apiService.post('/teacher/ai-create-quiz', { topicTitle, topicDescription, count, mcCount, tfCount });
    }

    async createSlide(topicTitle: string, topicDescription?: string, notes?: string): Promise<Blob> {
        const response = await apiService.getAxiosInstance().post(
            '/teacher/ai-create-slide',
            { topicTitle, topicDescription, notes },
            { responseType: 'blob' },
        );
        return response.data as Blob;
    }

    async createPdf(topicTitle: string, topicDescription?: string, notes?: string): Promise<Blob> {
        const response = await apiService.getAxiosInstance().post(
            '/teacher/ai-create-pdf',
            { topicTitle, topicDescription, notes },
            { responseType: 'blob' },
        );
        return response.data as Blob;
    }

    downloadBlob(blob: Blob, filename: string) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    }

    async createAndDownloadSlide(topicTitle: string, topicDescription?: string, notes?: string) {
        const blob = await this.createSlide(topicTitle, topicDescription, notes);
        this.downloadBlob(blob, 'presentation.pptx');
        return blob;
    }

    async createAndDownloadPdf(topicTitle: string, topicDescription?: string, notes?: string) {
        const blob = await this.createPdf(topicTitle, topicDescription, notes);
        this.downloadBlob(blob, 'document.pdf');
        return blob;
    }

}
export default new ChadApi();