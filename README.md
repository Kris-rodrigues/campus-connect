# 🎓 Campus Connect

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18+-61DAFB.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-4285F4.svg)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Campus Connect** is a full-stack, AI-powered Learning Management System (LMS) built to modernize academic resource sharing and elevate student performance. With a sleek Bauhaus-inspired user interface, the platform offers streamlined study material discovery, interactive in-app PDF viewing, Google Gemini-powered learning tools (summaries, quizzes, context-aware document chat, and a 24/7 AI study assistant), gamified leaderboards, and role-based management for students, teachers, and administrators.

---

## 📸 Screenshots

### 🔑 Login & Authentication
*Secure split-layout login with role toggles, USN authentication, and date-of-birth verification.*

![Login Page](IMAGES/login%20Page.png)

### 👨‍🎓 Student Dashboard & Study Materials
*Curated notes organized by Branch, Semester, Subject, and Module with ratings and AI actions.*

![Student Dashboard](IMAGES/Student%20Page.png)

### 👩‍🏫 Teacher Dashboard
*Manage departmental materials, monitor student rosters, and contribute learning resources.*

![Teacher Dashboard](IMAGES/Teacher%20Page.png)

### ⚙️ Admin Dashboard
*System-wide controls: student & faculty user management, note moderation, subscription monitoring, and database resets.*

![Admin Dashboard](IMAGES/Admin%20Page.png)

---

## 🚀 Key Features

### 🔐 1. Authentication & Role-Based Access Control (RBAC)
* **Student Access:** Log in seamlessly with University Seat Number (USN) and Date of Birth.
* **Teacher Access:** Dedicated login with name and DOB validation.
* **Admin Controls:** Full administrative authority for curriculum management, user moderation, and subscription tracking.
* **JWT Protected:** All API communication is secured via JSON Web Tokens with strict role middleware.

### 📚 2. Academic Resource Hub
* **Hierarchical Filtering:** Browse materials quickly by `Branch` → `Semester` → `Subject` → `Module`.
* **In-App PDF Viewer:** Split-screen reading experience with embedded note tools.
* **Smart Preview:** Freemium tier grants access to initial pages of study materials; premium subscribers unlock full document access.
* **Community Ratings & Reviews:** Rate study materials with 1–5 stars and leave feedback to highlight top resources.

### 🤖 3. Google Gemini AI Learning Suite
* **Document Summarizer:** Generates concise, structured summaries of complex academic PDFs in seconds.
* **Automated Quiz Generator:** Extracts key concepts to produce multiple-choice quizzes for self-assessment.
* **Context-Aware Document Chat:** Ask questions directly about the document with full conversational memory.
* **AI Study Assistant Modal:** 24/7 universal academic tutor for explaining concepts, solving problems step-by-step, and sharing study tips.

### 🏆 4. Gamified Testing & Leaderboard
* **Timed Quizzes:** Interactive test interface featuring a real-time countdown timer, instant evaluation, and score breakdown.
* **Live Leaderboard:** Tracks and ranks students across branches and semesters.
* **Achievement Badges:** Awards Gold, Silver, and Bronze badges based on assessment results.

### 💳 5. Freemium Subscription & Payment Gateway
* **Razorpay Integration:** Secure checkout flow (Test Mode) allowing students to upgrade to Premium.
* **Feature Unlocks:** Unrestricted document reading, unlimited AI document chat, automated quiz generation, and premium study materials.

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React.js (v18), React Router v6, CSS3 (Bauhaus-inspired design), React-Markdown, Remark-GFM |
| **Backend** | Node.js, Express.js (RESTful API architecture) |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **AI Integration** | Google Gemini API (`@google/generative-ai`) |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt.js |
| **File Processing** | Multer (upload handling), `pdf-lib` (PDF manipulation), `pdf.js-extract` (text extraction) |
| **Payment Gateway** | Razorpay Node.js SDK & Frontend Checkout |

---

## 📁 Project Structure

```text
campus-connect/
├── client/                      # React frontend
│   ├── public/                  # Public assets & HTML template
│   ├── src/
│   │   ├── components/          # Reusable UI components & modals
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AiAssistantModal.js
│   │   │   ├── Dashboard.js
│   │   │   ├── LeaderboardPage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── NoteCard.js
│   │   │   ├── RatingModal.js
│   │   │   ├── StudyMaterialsPage.js
│   │   │   ├── TestModal.js
│   │   │   └── ViewPdfModal.js
│   │   ├── App.js               # Route definitions
│   │   ├── index.js             # Client entry point
│   │   └── index.css            # Global design system & theme variables
│   └── package.json
│
├── server/                      # Express backend
│   ├── controllers/             # Request handlers (auth, notes, AI, payments, users)
│   ├── middleware/              # Auth, Admin, and Subscription middlewares
│   ├── models/                  # Mongoose schemas (User, Note, Quiz, Review, ChatHistory)
│   ├── routes/                  # Express route definitions
│   ├── uploads/                 # Storage for uploaded PDF notes (git-ignored)
│   ├── .env.example             # Template for required environment variables
│   ├── server.js                # Server entry point
│   └── package.json
│
├── IMAGES/                      # UI screenshots for documentation
├── .gitignore                   # Multi-tier ignore rules (protects .env & secrets)
└── README.md
```

---

## 🛠️ Installation & Setup

### 📋 Prerequisites
Ensure you have the following installed locally:
* **Node.js** (v18.x or later) — [Download Node.js](https://nodejs.org/)
* **npm** (v9.x or later)
* **MongoDB** connection string (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
* **Google Gemini API Key** — [Get an API Key](https://aistudio.google.com/)
* *(Optional)* **Razorpay Test Keys** — [Razorpay Dashboard](https://dashboard.razorpay.com/)

---

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Kris-rodrigues/campus-connect.git
cd campus-connect
```

---

### 2️⃣ Configure Environment Variables

Create a `.env` file inside the `server/` directory based on `server/.env.example`:

```bash
cp server/.env.example server/.env
```

Open `server/.env` and supply your actual credentials:

```env
# MongoDB Connection URI
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/campus-connect?retryWrites=true&w=majority

# JSON Web Token Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Razorpay Keys (Test Mode)
RAZORPAY_KEY_ID=rzp_test_yourKeyIdHere
RAZORPAY_KEY_SECRET=yourKeySecretHere

# Client Application URL
CLIENT_URL=http://localhost:3000
```

> [!IMPORTANT]
> **Never commit your `.env` file to version control.** The repository `.gitignore` is pre-configured to strictly ignore `.env`, `.env.*`, and all secret files across all folders.

---

### 3️⃣ Backend Setup
```bash
cd server
npm install
npm run dev # or: node server.js
```
The backend server will launch on **`http://localhost:5000`**.

---

### 4️⃣ Frontend Setup
Open a separate terminal window:
```bash
cd client
npm install
npm start
```
The React development server will launch on **`http://localhost:3000`** and automatically proxy API calls to the backend.

---

## 🛡️ API Endpoints Overview

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate Student, Teacher, or Admin | Public |
| `GET` | `/api/notes` | Get all published study materials | Authenticated |
| `GET` | `/api/notes/filter` | Query notes by Branch, Semester, Subject, Module | Authenticated |
| `GET` | `/api/notes/view/:noteId` | Stream PDF (full or 2-page preview based on subscription) | Authenticated |
| `POST` | `/api/notes/upload` | Upload new PDF note with metadata | Admin / Teacher |
| `PUT` | `/api/notes/update/:id` | Update note details or replace PDF | Admin / Teacher |
| `DELETE`| `/api/notes/delete/:id` | Remove a note and delete stored file | Admin / Teacher |
| `POST` | `/api/notes/:noteId/rate` | Submit or update a 1-5 star review | Authenticated |
| `POST` | `/api/ai/assistant` | General AI Study Assistant chat | Authenticated |
| `GET` | `/api/ai/chat/:noteId` | Retrieve persistent chat history for note | Subscribed / Admin |
| `POST` | `/api/ai/chat/:noteId` | Context-aware chat with PDF document | Subscribed / Admin |
| `POST` | `/api/ai/summarize/:noteId` | Generate AI summary of document | Subscribed / Admin |
| `POST` | `/api/ai/quiz/:noteId` | Generate 5-question AI quiz from document | Subscribed / Admin |
| `POST` | `/api/payment/create-order` | Initialize Razorpay subscription order | Authenticated |
| `POST` | `/api/payment/verify-payment`| Verify payment signature & update user status | Authenticated |
| `GET` | `/api/quiz/leaderboard` | Get ranked leaderboard standings | Authenticated |
| `GET` | `/api/users/students` | List all registered students | Admin / Teacher |
| `POST` | `/api/users/add-student` | Register a new student | Admin / Teacher |

---

## 🔒 Security & Privacy Practices

* **Zero-Leakage Git Configuration:** `.gitignore` blocks all environment files (`.env`, `**/.env`, `**/.env.*`), temporary directories, uploads, logs, and build artifacts.
* **Sanitized Templates:** Only `.env.example` containing clean, empty placeholders is tracked in the repository.
* **Role Verification:** Critical endpoints utilize cascading middleware (`authMiddleware`, `adminMiddleware`, and `subscriptionMiddleware`) to enforce access boundaries on the server side.
* **Safe Error Handling:** Sensitive system details and stack traces are suppressed in user-facing API responses.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
