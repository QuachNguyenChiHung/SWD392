import Anthropic from "@anthropic-ai/sdk";
import dotenv from 'dotenv';
dotenv.config();
const client = new Anthropic({
    apiKey: process.env.CLAUDE_KEY_API,
});

export interface AiModelResult {
    text: string;
    inputTokens: number;
    outputTokens: number;
}

interface ChatMessage {
    content: string;
    sender: "user" | "ai";
}

async function runModel(prompt: string): Promise<AiModelResult> {
    const msg = await client.messages.create({
        model: process.env.CLAUDE_KEY_MODAL_SECONDARY || "Blaude-Baiku-4.5",
        max_tokens: 10024,
        messages: [
            { role: "user", content: prompt }
        ]
    });
    const content = msg.content[0] as any;
    return {
        text: content.text,
        inputTokens: msg.usage?.input_tokens ?? 0,
        outputTokens: msg.usage?.output_tokens ?? 0,
    };
}

async function runModelWithHistory(prompt: ChatMessage[]): Promise<AiModelResult> {
    const msg = await client.messages.create({
        model: process.env.CLAUDE_KEY_MODAL_SECONDARY || "Blaude-Baiku-4.5",
        max_tokens: 10024,
        messages: prompt.map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.content }))
    });
    const content = msg.content[0] as any;
    return {
        text: content.text,
        inputTokens: msg.usage?.input_tokens ?? 0,
        outputTokens: msg.usage?.output_tokens ?? 0,
    };
}


export { runModel, runModelWithHistory };