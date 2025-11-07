const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth0Verify');
const Chat = require('../models/Chat');
const OpenAI = require('openai');
const pdfParse = require('pdf-parse');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Helper function to extract text and images from PDF
async function extractPdfContent(buffer) {
    try {
        const data = await pdfParse(buffer);
        return {
            text: data.text,
            info: data.info,
            metadata: data.metadata,
            imageData: [] // You can extend this to handle images if needed
        };
    } catch (error) {
        console.error('PDF parsing error:', error);
        throw error;
    }
}

// Helper function to chunk text for context
function chunkText(text, maxLength = 2000) {
    const chunks = [];
    let current = '';
    const sentences = text.split('. ');

    for (const sentence of sentences) {
        if ((current + sentence).length <= maxLength) {
            current += sentence + '. ';
        } else {
            if (current) chunks.push(current.trim());
            current = sentence + '. ';
        }
    }
    if (current) chunks.push(current.trim());
    return chunks;
}

// Initialize or get existing chat session
router.post('/init', auth, async (req, res) => {
    try {
        const { documentId, context } = req.body;
        const userId = req.user.id;

        let chat = await Chat.findOne({ userId, documentId });
        
        if (!chat) {
            chat = new Chat({
                userId,
                documentId,
                context,
                messages: []
            });
            await chat.save();
        }

        res.json({ chatId: chat._id, messages: chat.messages });
    } catch (error) {
        console.error('Chat initialization error:', error);
        res.status(500).json({ error: "Failed to initialize chat" });
    }
});

// Handle chat messages
router.post('/ask', auth, async (req, res) => {
    try {
        const { question, pdfContent, chatId, context } = req.body;
        const userId = req.user.id;

        // Basic input validation
        if (!question || !pdfContent) {
            return res.status(400).json({ error: "Question and PDF content are required" });
        }

        // Get or create chat session
        let chat = await Chat.findById(chatId);
        if (!chat) {
            chat = new Chat({
                userId,
                documentId: Date.now().toString(), // Generate temporary ID
                context: pdfContent,
                messages: []
            });
        }

        // Prepare conversation history
        const conversationHistory = chat.messages.slice(-5).map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        // Create messages array for OpenAI
        const messages = [
            {
                role: "system",
                content: `You are a helpful assistant analyzing a document. Here's the relevant context: ${pdfContent.slice(0, 2000)}...`
            },
            ...conversationHistory,
            { role: "user", content: question }
        ];

        try {
            // Get response from OpenAI
            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: messages,
                temperature: 0.7,
                max_tokens: 500
            });

            const answer = completion.choices[0].message.content;

            // Save messages to chat history
            chat.messages.push(
                { role: 'user', content: question },
                { role: 'assistant', content: answer }
            );
            await chat.save();

            res.json({ 
                answer,
                chatId: chat._id,
                messageHistory: chat.messages
            });
        } catch (error) {
            // Fallback to basic response if OpenAI fails
            const fallbackResponse = await generateBasicResponse(question, pdfContent);
            
            chat.messages.push(
                { role: 'user', content: question },
                { role: 'assistant', content: fallbackResponse }
            );
            await chat.save();

            res.json({ 
                answer: fallbackResponse,
                chatId: chat._id,
                messageHistory: chat.messages,
                isFailback: true
            });
        }
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: "Failed to process question" });
    }
});

// Basic fallback response generator
async function generateBasicResponse(question, pdfContent) {
    const content = pdfContent.toLowerCase();
    const q = question.toLowerCase();
    
    const paragraphs = content.split('\n\n');
    const relevantParagraph = paragraphs.find(p => 
        p.includes(q) || 
        q.split(' ').some(word => word.length > 3 && p.includes(word))
    );

    if (relevantParagraph) {
        return relevantParagraph.trim();
    }

    return "I couldn't find specific information about that in the document. Could you please rephrase your question?";
}

// Get chat history
router.get('/history/:documentId', auth, async (req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.user.id;

        const chat = await Chat.findOne({ userId, documentId });
        if (!chat) {
            return res.json({ messages: [] });
        }

        res.json({ messages: chat.messages });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: "Failed to fetch chat history" });
    }
});

module.exports = router;