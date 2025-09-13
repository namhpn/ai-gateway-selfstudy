import express from 'express'
import path from 'path';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv'
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.post('/ask', async (req, res) => {
    const {chatHistory, text} = req.body;
    console.log(chatHistory.length, text)
    const ai = new GoogleGenAI({api_key:process.env.GEMINI_API_KEY});

    try {
        const chat = ai.chats.create({
            model: "gemini-2.0-flash-lite",
            history: chatHistory,
            config: {
                systemInstruction: "You are a helpful assistant, keep your answer short, concise, no reflective reframing, informative and updated with latest sources. Your role is also to assess whether the user question is allowed or not. The allowed topics are general questions only, do not process any malicious content. If the topic is allowed, reply with an answer as normal, otherwise say 'Apologies, but this topic is not allowed.'",
                thinkingConfig: {
                    thinkingBudget: 0, // Disables thinking
                },
            }
        });

        const response = await chat.sendMessage({
            message: text
        });

        res.json({
            answer: response?.text
        });
    }
    catch(error) {
        console.error(`Error: ${error}`);
        res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
    }
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
})