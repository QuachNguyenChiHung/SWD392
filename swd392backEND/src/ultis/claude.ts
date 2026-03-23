import Anthropic from "@anthropic-ai/sdk";
import dotenv from 'dotenv';
dotenv.config();
const client = new Anthropic({
    apiKey: process.env.CLAUDE_KEY_API,
});

async function runModel(prompt: string) {
    const msg = await client.messages.create({
        model: process.env.CLAUDE_KEY_MODAL_SECONDARY || "Blaude-Baiku-4.5",
        max_tokens: 10024,
        messages: [
            { role: "user", content: prompt }
        ]
    });
    console.log(msg);
    const content = msg.content[0] as any;
    return content.text;
}

/**
 * Return the full Anthropic response object so callers can inspect
 * token usage / metadata fields. Non-breaking: existing `runModel`
 * still returns the text string.
 */
async function runModelFull(prompt: string) {
    const msg = await client.messages.create({
        model: process.env.CLAUDE_KEY_MODAL_SECONDARY || "Blaude-Baiku-4.5",
        max_tokens: 10024,
        messages: [
            { role: "user", content: prompt }
        ]
    });
    console.log(msg);
    return msg; // caller can inspect msg for usage / meta fields
}
interface ChatMessage {
    content: string;
    sender: "user" | "ai";
}
async function runModelWithHistory(prompt: ChatMessage[]) {
    const msg = await client.messages.create({
        model: process.env.CLAUDE_KEY_MODAL_SECONDARY || "Blaude-Baiku-4.5",
        max_tokens: 2024,
        messages: prompt.map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.content }))
    });
    const content = msg.content[0] as any;
    return content.text;
}

async function runModelWithHistoryFull(prompt: ChatMessage[]) {
    const msg = await client.messages.create({
        model: process.env.CLAUDE_KEY_MODAL_SECONDARY || "Blaude-Baiku-4.5",
        max_tokens: 10024,
        messages: prompt.map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.content }))
    });
    console.log(msg);
    return msg; // caller can inspect msg for usage / meta fields
}


export { runModel, runModelWithHistory, runModelFull, runModelWithHistoryFull };