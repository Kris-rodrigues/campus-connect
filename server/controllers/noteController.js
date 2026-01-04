const Note = require('../models/Note');
const User = require('../models/User'); // Import User model
const Review = require('../models/Review');
const fs = require('fs').promises; // Use 'fs/promises'
const path = require('path');
const { PDFDocument } = require('pdf-lib'); // Import pdf-lib
const { PDFExtract } = require('pdf.js-extract'); // Import pdf.js-extract
const mongoose = require('mongoose'); // Import mongoose

// API Key and Model setup for Gemini
const { GoogleGenerativeAI } = require("@google/generative-ai");
if (!process.env.GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not defined in .env file.");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest"});


// --- PDF Text Extraction Function ---
async function getTextFromPdf(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`PDF file not found at path: ${filePath}`);
        }
        const pdfExtract = new PDFExtract();
        const options = {}; 
        const data = await pdfExtract.extract(filePath, options);
        const pdfText = data.pages.map(page => 
            page.content.map(item => item.str).join(' ')
        ).join('\n');
        return pdfText;
    } catch (error) {
        console.error("Error parsing PDF with pdf.js-extract:", error);
        throw new Error(`Could not read or parse the PDF file: ${error.message}`);
    }
}

// --- Note Controllers ---
exports.getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find().populate('uploader', 'name usn').sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notes.', error });
  }
};

exports.getSubjectsForSemester = async (req, res) => {
  try {
    const { branch, semester } = req.query;
    if (!branch || !semester) {
      return res.status(400).json({ message: 'Branch and semester are required.' });
    }
    const subjects = await Note.distinct('subject', { branch, semester });
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subjects.', error });
  }
};

exports.getFilteredNotes = async (req, res) => {
  try {
    const { branch, semester, subject, module } = req.query;
    if (!branch || !semester || !subject || !module) {
      return res.status(400).json({ message: 'All filter criteria are required.' });
    }
    const notes = await Note.find({ branch, semester, subject, module })
                          .populate('uploader', 'name usn')
                          .sort({ createdAt: -1 });

    // 2. Calculate average rating for each note
    const notesWithRatings = await Promise.all(notes.map(async (note) => {
      const stats = await Review.aggregate([
        { $match: { note: note._id } },
        { $group: { _id: '$note', averageRating: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);
      return {
        ...note.toObject(), // Convert mongoose doc to plain object
        averageRating: stats[0]?.averageRating || 0,
        reviewCount: stats[0]?.count || 0,
      };
    }));

    res.status(200).json(notesWithRatings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch filtered notes.', error });
  }
};

exports.uploadNote = async (req, res) => {
  try {
    const { title, description, subject, branch, semester, module } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'No file was uploaded.' });
    }
    const newNoteData = {
      title, description, subject, branch, semester, module,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
    };
    if (req.user.role === 'admin') {
      newNoteData.uploaderName = req.user.name;
    } else {
      newNoteData.uploader = req.user.id;
    }
    const newNote = new Note(newNoteData);
    await newNote.save();
    res.status(201).json({ message: 'Note uploaded successfully!', note: newNote });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload note.', error: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, subject, branch, semester, module } = req.body;

    // 1. Find the existing note first
    const note = await Note.findById(id);
    if (!note) {
        return res.status(404).json({ message: 'Note not found.' });
    }

    // 2. Prepare update object
    const updateData = { title, description, subject, branch, semester, module };

    // 3. If a new file was uploaded, replace the old one
    if (req.file) {
        // Delete old file
        const oldFilePath = path.join(__dirname, '..', note.fileUrl);
        // Use fs.unlink without await inside a non-async callback logic, 
        // or just fire-and-forget catch for simplicity here
        fs.unlink(oldFilePath).catch(err => console.log("Old file delete failed (might not exist):", err.message));

        // Set new file details
        updateData.fileUrl = `/uploads/${req.file.filename}`;
        updateData.fileName = req.file.originalname;
    }

    // 4. Update database
    const updatedNote = await Note.findByIdAndUpdate(id, updateData, { new: true });
    
    res.status(200).json({ message: 'Note updated successfully!', note: updatedNote });

  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ message: 'Failed to update note.', error: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }
    const filePath = path.join(__dirname, '..', note.fileUrl);
    await fs.unlink(filePath); // Use await for fs.promises.unlink
    await Note.findByIdAndDelete(id);
    res.status(200).json({ message: 'Note deleted successfully!' });
  } catch (error) {
    // If file unlink fails but DB delete succeeds, it's not a critical server error
    if (error.code === 'ENOENT') {
        console.warn("File not found, but deleting DB entry anyway.");
        await Note.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: 'Note deleted from DB. File was not found.' });
    }
    res.status(500).json({ message: 'Failed to delete note.', error: error.message });
  }
};

// --- THIS IS THE UPDATED FUNCTION ---
exports.viewNoteFile = async (req, res) => {
    try {
        const { noteId } = req.params;
        const note = await Note.findById(noteId);

        if (!note || !note.fileUrl) {
            return res.status(404).json({ message: "File not found." });
        }

        const filePath = path.join(__dirname, '..', note.fileUrl);
        
        try {
            await fs.access(filePath);
        } catch (fileError) {
            return res.status(404).json({ message: "File not found on server." });
        }
        
        // --- FIX: Check for 'admin' OR 'teacher' ---
        if (req.user.role === 'admin' || req.user.role === 'teacher') {
            return res.sendFile(filePath); // Full access for staff
        }

        // Check student subscription
        const user = await User.findById(req.user.id);

        if (user && user.isSubscribed) {
            return res.sendFile(filePath);
        } else {
            // Free Student: Send 2 pages
            const pdfBytes = await fs.readFile(filePath);
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const newDoc = await PDFDocument.create();
            const pageCount = Math.min(2, pdfDoc.getPageCount());
            const copiedPages = await newDoc.copyPages(pdfDoc, Array.from({length: pageCount}, (_, i) => i));
            copiedPages.forEach(page => newDoc.addPage(page));
            const newPdfBytes = await newDoc.save();

            res.setHeader('Content-Type', 'application/pdf');
            res.send(Buffer.from(newPdfBytes));
        }
    } catch (error) {
        console.error("Error in viewNoteFile:", error);
        res.status(500).json({ message: "Error loading file." });
    }
};
// 3. Get all reviews for a specific note
exports.getNoteReviews = async (req, res) => {
  try {
    const { noteId } = req.params;
    const reviews = await Review.find({ note: noteId }).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews.' });
  }
};

// --- AI Controllers ---

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
        const prompt = `Please provide a concise summary of the following academic notes text. Focus on the main topics and key takeaways:\n\n---\n${pdfText}\n---\n\nSummary:`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = await response.text();
        res.status(200).json({ summary });
    } catch (error) {
        console.error("Error in summarizeNote controller:", error);
        if (error.message.includes("Could not read or parse")) {
             res.status(500).json({ message: "Error processing the PDF file." });
        } else {
             res.status(500).json({ message: "An unexpected error occurred while generating the summary.", error: error.message });
        }
    }
};
// 4. Add or update a review for a note
exports.addOrUpdateReview = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    const userName = req.user.name; // Get name from auth token

    if (!rating) {
      return res.status(400).json({ message: 'Rating is required.' });
    }

    // Find existing review from this user for this note
    let review = await Review.findOne({ note: noteId, user: userId });

    if (review) {
      // Update existing review
      review.rating = rating;
      review.comment = comment;
      await review.save();
      res.status(200).json({ message: 'Review updated successfully!', review });
    } else {
      // Create new review
      review = new Review({
        note: noteId,
        user: userId,
        userName: userName,
        rating: rating,
        comment: comment
      });
      await review.save();
      res.status(201).json({ message: 'Review added successfully!', review });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to add review.', error });
  }
};
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
        const prompt = `Based on the following academic notes text, generate a 5-question multiple-choice quiz. For each question, provide 4 options (A, B, C, D) and clearly indicate the correct answer.\n\n---\n${pdfText}\n---\n\nFormat the output like this:\n1. [Question 1]\nA) [Option A]\nB) [Option B]\nC) [Option C]\nD) [Option D]\nAnswer: [Correct Option Letter]\n\n2. [Question 2]\n...`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const quiz = await response.text(); 
        res.status(200).json({ quiz }); 
    } catch (error) {
        console.error("Error in generateQuiz controller:", error);
         if (error.message.includes("Could not read or parse")) {
             res.status(500).json({ message: "Error processing the PDF file." });
        } else {
             res.status(500).json({ message: "An unexpected error occurred while generating quiz.", error: error.message });
        }
    }
};

exports.generateDescriptiveQA = async (req, res) => {
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
        const prompt = `Based on the following academic notes text, generate 3-5 descriptive questions that require explanatory answers. For each question, provide a concise answer derived solely from the text:\n\n---\n${pdfText}\n---\n\nFormat the output like this:\nQ1: [Question 1]\nA1: [Answer 1]\n\nQ2: [Question 2]\nA2: [Answer 2]\n...`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const qaPairs = await response.text();
        res.status(200).json({ qaPairs });
    } catch (error) {
        console.error("Error in generateDescriptiveQA controller:", error);
         if (error.message.includes("Could not read or parse")) {
             res.status(500).json({ message: "Error processing the PDF file." });
        } else {
             res.status(500).json({ message: "An unexpected error occurred while generating Q&A.", error: error.message });
        }
    }
};