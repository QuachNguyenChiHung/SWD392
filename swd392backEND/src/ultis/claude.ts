import Anthropic from "@anthropic-ai/sdk";
import dotenv from 'dotenv';
dotenv.config();
const client = new Anthropic({
    apiKey: process.env.CLAUDE_KEY_API,
});

async function runModel(prompt: string) {
    const msg = await client.messages.create({
        model: process.env.CLAUDE_KEY_MODAL || "Blaude-Baiku-4.5",
        max_tokens: 1024,
        messages: [
            { role: "user", content: prompt }
        ]
    });
    const content = msg.content[0] as any;
    return content.text;
}
interface ChatMessage {
    content: string;
    sender: "user" | "ai";
}
async function runModelWithHistory(prompt: ChatMessage[]) {
    const msg = await client.messages.create({
        model: process.env.CLAUDE_KEY_MODAL || "Blaude-Baiku-4.5",
        max_tokens: 1024,
        messages: prompt.map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.content }))
    });
    const content = msg.content[0] as any;
    return content.text;
}
export { runModel, runModelWithHistory };