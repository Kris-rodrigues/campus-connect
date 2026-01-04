const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Note = require('../models/Note');
const ChatHistory = require('../models/ChatHistory');
const { PDFExtract } = require('pdf.js-extract');

// 1. Validate API Key
if (!process.env.GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not defined in .env file.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 2. Initialize Model
// using 'gemini-1.5-flash' is recommended for speed and efficiency.
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

// 3. Helper: PDF Text Extraction
async function getTextFromPdf(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`PDF file not found at path: ${filePath}`);
        }
        
        const pdfExtract = new PDFExtract();
        const options = {}; 
        
        const data = await pdfExtract.extract(filePath, options);
        
        // Extract text from all pages and join them
        const pdfText = data.pages.map(page => 
            page.content.map(item => item.str).join(' ')
        ).join('\n');
        
        return pdfText;

    } catch (error) {
        console.error("Error parsing PDF with pdf.js-extract:", error);
        throw new Error(`Could not read or parse the PDF file: ${error.message}`);
    }
}

// --- FEATURE 1: Summarize Note ---
exports.summarizeNote = async (req, res) => {
    try {
        const { noteId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(noteId)) {
             return res.status(400).json({ message: "Invalid Note ID format." });
        }
        const note = await Note.findById(noteId);
        if (!note || !note.fileUrl) {
            return res.status(404).json({ message: "Note or associated file URL not found." });
        }

        const filePath = path.join(__dirname, '..', note.fileUrl);
        const pdfText = await getTextFromPdf(filePath); 
        
        if (!pdfText || pdfText.trim().length < 50) {
             return res.status(400).json({ message: "Could not extract sufficient text from the PDF to summarize." });
        }

        // Limit text length to prevent token limits (~30k chars is safe for Flash)
        const maxLength = 30000;
        const truncatedText = pdfText.substring(0, maxLength);

        console.log(`Extracted ~${pdfText.length} characters from PDF: ${note.fileName}`);
        
        const prompt = `Please provide a concise summary of the following academic notes text. Focus on the main topics and key takeaways:\n\n---\n${truncatedText}\n---\n\nSummary:`;
        
        console.log("Sending request to Gemini for summary...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = await response.text();
        
        console.log("Received summary from Gemini.");
        res.status(200).json({ summary });

    } catch (error) {
        console.error("Error in summarizeNote controller:", error);
        if (error.message.includes("Could not read or parse")) {
             res.status(500).json({ message: "Error processing the PDF file." });
        } else if (error.message.includes("API key") || error.message.includes("quota") || error.message.includes("Not Found")) {
             res.status(500).json({ message: "AI API Error: Invalid Key or Model Not Found. Check your API Key." });
        } else {
             res.status(500).json({ message: "An unexpected error occurred while generating the summary.", error: error.message });
        }
    }
};

// --- FEATURE 2: Generate Quiz ---
exports.generateQuiz = async (req, res) => {
    try {
        const { noteId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(noteId)) {
             return res.status(400).json({ message: "Invalid Note ID format." });
        }
        const note = await Note.findById(noteId);
        if (!note || !note.fileUrl) {
            return res.status(404).json({ message: "Note or file not found." });
        }
        const filePath = path.join(__dirname, '..', note.fileUrl);
        const pdfText = await getTextFromPdf(filePath);
        
        if (!pdfText || pdfText.trim().length < 50) {
             return res.status(400).json({ message: "Could not extract sufficient text from PDF." });
        }
        
        const maxLength = 30000;
        const truncatedText = pdfText.substring(0, maxLength);

        // We ask Gemini to return a strict JSON array
        const prompt = `Based on the text below, generate 5 multiple-choice questions.
        Return the output as a strictly valid JSON array of objects. Do not include markdown formatting (like \`\`\`json).
        Each object should have:
        - "question": The question string.
        - "options": An array of 4 string options (A, B, C, D).
        - "answer": The *index* of the correct option (0 for A, 1 for B, 2 for C, 3 for D).

        TEXT CONTENT:
        ${truncatedText}`;
        
        console.log("Sending Quiz request to Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let quizText = await response.text(); 
        
        // Clean up potential markdown code blocks if Gemini adds them
        quizText = quizText.replace(/```json/g, '').replace(/```/g, '').trim();

        console.log("Received Quiz from Gemini.");

        // Validate JSON before sending
        try {
            const quizJson = JSON.parse(quizText);
            res.status(200).json({ quiz: quizJson }); 
        } catch (e) {
            console.error("Failed to parse AI response as JSON:", quizText);
            res.status(500).json({ message: "AI generated an invalid quiz format. Please try again." });
        }

    } catch (error) {
        console.error("Error in generateQuiz controller:", error);
        res.status(500).json({ message: "An unexpected error occurred while generating quiz.", error: error.message });
    }
};

// --- FEATURE 3: Get Chat History ---
exports.getChatHistory = async (req, res) => {
    try {
        const { noteId } = req.params;
        const userId = req.user.id;

        // Helper to find history regardless of user ID type (String/ObjectId)
        const history = await ChatHistory.findOne({ note: noteId, user: userId });

        if (history) {
            res.status(200).json(history.messages);
        } else {
            const greeting = {
                sender: 'ai',
                text: 'Hello! Ask me any question about this document.'
            };
            res.status(200).json([greeting]);
        }
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ message: 'Failed to get chat history.' });
    }
};

// --- FEATURE 4: Persistent Chat ---
exports.chatWithNote = async (req, res) => {
     try {
        const { noteId } = req.params;
        const { question } = req.body;
        const userId = req.user.id;

        if (!question) {
            return res.status(400).json({ message: "A question is required." });
        }

        if (!mongoose.Types.ObjectId.isValid(noteId)) {
             return res.status(400).json({ message: "Invalid Note ID format." });
        }
        const note = await Note.findById(noteId);
        if (!note || !note.fileUrl) {
            return res.status(404).json({ message: "Note or file not found." });
        }

        const filePath = path.join(__dirname, '..', note.fileUrl);
        const pdfText = await getTextFromPdf(filePath);
        
        if (!pdfText || pdfText.trim().length < 50) {
             return res.status(400).json({ message: "Could not extract sufficient text from PDF." });
        }

        // 1. Find or create the chat history
        const history = await ChatHistory.findOneAndUpdate(
            { note: noteId, user: userId },
            { $setOnInsert: { note: noteId, user: userId, messages: [] } }, // Create if it doesn't exist
            { new: true, upsert: true }
        );

        // 2. Add the user's new question to history
        history.messages.push({ sender: 'user', text: question });
        
        // 3. Format chat history context for the AI
        // We grab the last few messages so the AI remembers the conversation context
        const recentMessages = history.messages.slice(-6); 
        const chatContext = recentMessages
            .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
            .join('\n');
            
        const maxLength = 25000;
        const truncatedText = pdfText.substring(0, maxLength);

        const prompt = `You are a helpful study assistant. Use the following text context to answer the user's question. If the answer is not in the text, say "I cannot find the answer to that in this document."\n\nCONTEXT:\n---\n${truncatedText}\n---\n\nCHAT HISTORY:\n${chatContext}\n\nUser: ${question}\n\nAssistant:`;
        
        console.log("Sending Chat request to Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const answer = await response.text();
        console.log("Received Chat Answer from Gemini.");

        // 4. Add the AI's answer to history and save
        history.messages.push({ sender: 'ai', text: answer });
        await history.save();
        
        res.status(200).json({ answer });

    } catch (error) {
        console.error("Error in chatWithNote controller:", error);
         res.status(500).json({ message: "An unexpected error occurred while generating an answer.", error: error.message });
    }
};