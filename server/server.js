require('dotenv').config(); // Load .env variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes'); // Import the new AI routes
const quizRoutes = require('./routes/quizRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure 'uploads' directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("Created 'uploads' directory.");
}

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies

// Serve static files (uploaded PDFs) from the 'uploads' directory
// Makes files accessible via http://localhost:5000/uploads/filename.pdf
app.use('/uploads', express.static(uploadsDir));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes); // Mount the AI routes
app.use('/api/payment', paymentRoutes);
app.use('/api/quiz', quizRoutes);

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('MongoDB Connected...');
  // Start the server only after successful DB connection
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(err => {
  console.error("MongoDB Connection Error:", err);
  process.exit(1); // Exit if DB connection fails
});