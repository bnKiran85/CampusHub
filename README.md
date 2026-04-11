# 🧠 CampusHub — Smart AI Learning Platform

> A next-generation, AI-powered academic hub for college students. Built with the MERN stack + Google Gemini AI — combining the best of Notion, Google Classroom, ChatGPT, and Duolingo.

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47a248?logo=mongodb)](https://mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini_AI-4285F4?logo=google)](https://aistudio.google.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Key Features

### 🤖 Advanced AI Integration (Powered by Gemini 1.5-Flash)
*   **Native JSON Mode**: High-reliability AI responses with zero parsing failures.
*   **AI Study Assistant**: Floating conversational bot with context-aware learning support.
*   **Flash Quiz Generator**: Instantly generate MCQ quizzes from any topic or file content.
*   **Smart Study Planner**: AI-driven weekly schedules based on assignment priority and deadlines.
*   **Content Summarizer**: One-click extraction of key points from long academic documents.

### 🎮 Gamified Productivity
*   **XP & Leveling**: Earn XP for every academic action; level up every 200 points.
*   **Focus Mode**: Premium Pomodoro timer with glow animations and XP rewards.
*   **Global Leaderboard**: Real-time ranking of top contributors and learners.
*   **Daily Streaks**: Encourages consistent study habits via visual tracking.

### 🏛️ Moderation & Community
*   **Admin Dashboard**: Dedicated portal for moderating community-shared study materials.
*   **Discussion Forum**: Full-featured Q&A platform with upvoting and nested replies.
*   **Resource Sharing**: Upload and verify study materials for the whole campus.

---

## 📁 Project Structure

```bash
CampusHub/
│
├── frontend/                  # React + Vite + Tailwind (Vite 8)
│   ├── src/
│   │   ├── api/               # Standardized Axios interceptors for Auth
│   │   ├── components/        # Reusable UI (Sidebar, Navbar, AI Chat)
│   │   ├── context/           # Global Auth State (JWT Management)
│   │   └── pages/             # Route components (Dashboard, Quiz, etc.)
│   └── public/                # Static assets
│
└── backend/                   # Node.js + Express (Production Build)
    ├── controllers/           # Refactored MVC Logic (AI, Auth, Material)
    ├── middleware/            # Security, Auth, Error Handling
    ├── models/                # MongoDB (Mongoose) Schemas
    ├── routes/                # Centralized API Routing
    └── server.js              # Entry point with Startup Audits
```

---

## 🚀 Installation & Setup

### 1. Prerequisites
- **Node.js**: Version 18 or higher.
- **MongoDB**: A local instance or MongoDB Atlas cluster.
- **Google AI Studio Key**: Get your free Gemini API key [here](https://aistudio.google.com/app/apikey).

### 2. Environment Configuration
Create a `.env` file in the **backend** directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_complex_secret_key
GEMINI_API_KEY=your_google_api_key
FRONTEND_URL=http://localhost:5173
```

Create a `.env` file in the **frontend** directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Quick Start
```bash
# Clone the repository
git clone https://github.com/your-username/CampusHub.git

# Install Backend & Run
cd backend
npm install
npm run dev

# In a NEW terminal, Install Frontend & Run
cd ../frontend
npm install
npm run dev
```

---

## 🔌 API Documentation (Summary)

| Service | Endpoint | Method | Role |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/login` | POST | Public |
| **AI Chat** | `/api/ai/chat` | POST | User |
| **AI Quiz** | `/api/ai/quiz` | POST | User |
| **Admin** | `/api/admin/pending` | GET | Admin |
| **Materials** | `/api/materials/:id/verify` | PATCH | Admin |

---

## 🤝 Roadmap & Contributing
- [ ] Real-time Peer Collaboration (Socket.io)
- [ ] PDF to Flashcard Generator
- [ ] Multi-campus support
- [ ] Mobile App (React Native bridge)

**Contributions are welcome! Please fork this repository and submit a Pull Request.**

---

## 📄 License
This project is licensed under the **MIT License**.

*Built with passion for the global student community.*
