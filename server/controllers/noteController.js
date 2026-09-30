const Note = require('../models/Note');
const User = require('../models/User'); // Import User model
const Review = require('../models/Review');
const fs = require('fs').promises; // Use 'fs/promises'
const path = require('path');
const { PDFDocument } = require('pdf-lib'); // Import pdf-lib
const mongoose = require('mongoose'); // Import mongoose

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
