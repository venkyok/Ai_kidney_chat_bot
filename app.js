require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai'); // Updated OpenAI import

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('templates'));
// Validate environment variable
if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY environment variable');
}


// Updated OpenAI client initialization
const openai = new OpenAI({apiKey: process.env.API_KEY});

class TeluguKidneyDietAI {
    constructor() {
        this.basePrompt = `
        You are a Telugu-speaking kidney diet assistant. Provide culturally relevant advice for rural Indian people.
        Always respond in Telugu script. Keep responses simple and clear.
        Current conversation:
        `;
        this.fallbackResponses = {
            'healthy_foods': `
            మంచి ఆహారాలు:
            - బియ్యం, జొన్నలు, రాగులు
            - పెసలు, మినుములు (తక్కువ మందం)
            - గుమ్మడి, సొరకాయ, బెండకాయ
            - దోసకాయ, కాకరకాయ
            `,
            'error': "క్షమించండి, ప్రస్తుతం సేవ అందుబాటులో లేదు. దయచేసి తర్వాత ప్రయత్నించండి."
        };
    }

    async getAIResponse(userInput) {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                store: true,
                messages: [
                    { role: "system", content: this.basePrompt },
                    { role: "user", content: userInput }
                ],
                temperature: 0.7,
                max_tokens: 150
            });

            return completion.choices[0].message.content.trim();
        } catch (error) {
            console.error(`Error: ${error}`);
            return this.fallbackResponses['error'];
        }
    }
}

const bot = new TeluguKidneyDietAI();

app.get('/', (req, res) => {
    res.send('Welcome to Telugu Kidney Diet AI!');
});

app.post('/chat', async (req, res) => {
    const userInput = req.body.message || '';
    const response = await bot.getAIResponse(userInput);
    res.json({ response });
});

// Basic error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
