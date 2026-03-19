import { DEFAULT_DESKTOP_MODE_MEDIA_QUERY } from "@mui/x-date-pickers/internals";
import type { ChatMessage } from "../../pages/teacher/aiContentGenerator";
import { apiService } from "../api";

class ChadApi {
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

}
export default new ChadApi();