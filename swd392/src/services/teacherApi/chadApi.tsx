
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
                sender: m.sender === "user" ? "user" : "ai"
            }
        })
        return await apiService.post('/teacher/ai-chad', { prompt: cleaned });
    }

    async createQuiz(topicTitle: string, topicDescription: string | undefined, count: number, mcCount: number, tfCount: number): Promise<{ rawContent?: string, message?: string, tokens?: any }> {
        const response = await apiService.post('/teacher/ai-create-quiz', { topicTitle, topicDescription, count, mcCount, tfCount });
        console.log('Quiz API response:', response);
        console.log('Tokens from response:', response.tokens);
        return response;
    }

    async createSlide(topicTitle: string, topicDescription?: string, notes?: string): Promise<{ blob: Blob, message: string, tokens?: any }> {
        const response = await apiService.getAxiosInstance().post(
            '/teacher/ai-create-slide',
            { topicTitle, topicDescription, notes }
        );
        const data = response.data;
        console.log('Slide API response data:', data);
        console.log('Tokens from response:', data.tokens);
        const binaryString = window.atob(data.fileBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
        return { blob, message: data.message, tokens: data.tokens };
    }

    async createPdf(topicTitle: string, topicDescription?: string, notes?: string): Promise<{ blob: Blob, message: string, tokens?: any }> {
        const response = await apiService.getAxiosInstance().post(
            '/teacher/ai-create-pdf',
            { topicTitle, topicDescription, notes }
        );
        const data = response.data;
        console.log('PDF API response data:', data);
        console.log('Tokens from response:', data.tokens);
        const binaryString = window.atob(data.fileBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        return { blob, message: data.message, tokens: data.tokens };
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
        const { blob } = await this.createSlide(topicTitle, topicDescription, notes);
        this.downloadBlob(blob, 'presentation.pptx');
        return blob;
    }

    async createAndDownloadPdf(topicTitle: string, topicDescription?: string, notes?: string) {
        const { blob } = await this.createPdf(topicTitle, topicDescription, notes);
        this.downloadBlob(blob, 'document.pdf');
        return blob;
    }

}
export default new ChadApi();