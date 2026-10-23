# 🎓 StudyAI Assistant - Full-Stack MERN AI Study Platform

A modern, production-grade **MERN (MongoDB, Express.js, React, Node.js)** AI Study Assistant web application designed for students and self-learners to accelerate exam preparation, technical concept mastery, and coursework retention.

Built with **Tailwind CSS**, **React Router v7**, **JWT Authentication**, and an **Express.js MVC REST API** connected to **MongoDB Atlas**.

---

## 🌟 Key Features

1. **Intelligent AI Study Tutor (`/chat`)**:
   - ChatGPT-style conversational interface with automated scrolling (`useRef`).
   - Context-aware explanations for algorithms, database schemas, web development, and theory.
   - Persistent chat session history stored in MongoDB with "New Chat" and delete capabilities.
   - Integrated with Google Gemini API and a built-in academic inference engine.

2. **Note Summarizer (`/summary`)**:
   - Condenses lengthy textbook chapters, lecture transcripts, and articles into structured key takeaways and exam review checklists.
   - Dual-pane layout with word and character count indicators.
   - Quick clipboard copy and database archival.

3. **Interactive Quiz Generator (`/quiz`)**:
   - Converts any study topic or notes into 4-option multiple-choice quizzes for active recall practice.
   - Interactive question progression with real-time feedback.
   - Automatic scoring with detailed question breakdowns, explanations, and mastery rating.
   - Persists quiz scores directly to MongoDB.

4. **Study History & Archives (`/history`)**:
   - Tabbed archive view (`AI Chats` | `Summaries` | `Quizzes`).
   - Allows students to review past study materials and delete obsolete items.

5. **Student Dashboard (`/dashboard`)**:
   - Real-time aggregated statistics (Active Chats, Summaries Generated, Quizzes Completed).
   - Dynamic recent study timeline and Feynman Technique exam tips.

6. **Authentication & Profile Management (`/login`, `/register`, `/profile`)**:
   - Secure registration and login with `bcryptjs` password hashing and `jsonwebtoken` (JWT).
   - Protected routes (`ProtectedRoute`) safeguarding private study data.
   - Profile center for updating display name and credentials.

---

## 🛠️ Tech Stack & Architecture

### Frontend (`client/`)
- **React.js 19** with JSX
- **Tailwind CSS v4** for modern, responsive aesthetics
- **React Router DOM v7** for client-side routing & protected routes
- **Axios** with automatic request/response token interceptors
- **Lucide React** for icons
- **Context API (`AuthContext`)** for global authentication state management

### Backend (`server/`)
- **Node.js** & **Express.js** (ES Modules)
- **MongoDB Atlas** with **Mongoose** schemas and relationships
- **JSON Web Tokens (JWT)** for stateless token authentication
- **bcryptjs** for secure password salting and hashing
- **CORS** & centralized error handling middleware
- **Gemini AI Service** with built-in academic fallback engine

---

## 📂 Project Structure

```text
AI_assistant/
│
├── client/                              # React Frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Button.jsx               # Reusable button with loading & variants
│   │   │   ├── ChatInput.jsx            # Dynamic textarea with prompt chips
│   │   │   ├── ChatMessage.jsx          # Message bubble with avatars & copy button
│   │   │   ├── ErrorMessage.jsx         # Dismissible error alert
│   │   │   ├── FeatureCard.jsx          # Dashboard study tool cards
│   │   │   ├── Loading.jsx              # Reusable pulsating/spinner loader
│   │   │   ├── Navbar.jsx               # Sticky responsive header with navigation
│   │   │   └── ProtectedRoute.jsx       # Route guard based on auth status
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # Global auth state & session recovery
│   │   ├── hooks/
│   │   │   └── useAuth.js               # Custom auth hook
│   │   ├── pages/
│   │   │   ├── Login.jsx                # Controlled login form
│   │   │   ├── Register.jsx             # Controlled register form
│   │   │   ├── Dashboard.jsx            # Student dashboard with live metrics
│   │   │   ├── Chat.jsx                 # AI chat tutor interface
│   │   │   ├── Summary.jsx              # Note summarizer interface
│   │   │   ├── Quiz.jsx                 # Quiz generator & test flow
│   │   │   ├── History.jsx              # Tabbed database logs
│   │   │   └── Profile.jsx              # Profile & credentials settings
│   │   ├── services/
│   │   │   └── api.js                   # Axios client with interceptors
│   │   ├── App.jsx                      # App router configuration
│   │   ├── index.css                    # Tailwind CSS v4 setup
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
└── server/                              # Node & Express Backend
    ├── config/
    │   └── db.js                        # MongoDB Mongoose connection
    ├── controllers/
    │   ├── authController.js            # User registration & login
    │   ├── chatController.js            # Chat conversation handling
    │   ├── summaryController.js         # Note summarization
    │   ├── quizController.js            # Quiz generation & scoring
    │   └── userController.js            # Profile & password updates
    ├── middleware/
    │   ├── authMiddleware.js            # JWT Bearer verification
    │   └── errorMiddleware.js           # Centralized error handler
    ├── models/
    │   ├── User.js                      # User Mongoose model
    │   ├── Chat.js                      # Chat session & messages model
    │   ├── Note.js                      # Note summary model
    │   └── Quiz.js                      # 4-option quiz model
    ├── routes/
    │   ├── authRoutes.js
    │   ├── chatRoutes.js
    │   ├── summaryRoutes.js
    │   ├── quizRoutes.js
    │   └── userRoutes.js
    ├── services/
    │   └── aiService.js                 # Gemini AI & academic tutoring engine
    ├── .env                             # Environment variables
    ├── server.js                        # Express server entry point
    └── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB Atlas** URI (or local MongoDB daemon)

### 2. Backend Setup
1. Open a terminal in the `server` folder:
   ```bash
   cd server
   npm install
   ```
2. Configure `.env` in `server/.env`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   AI_API_KEY=your_gemini_api_key_optional
   ```
3. Start the backend:
   ```bash
   npm run dev
   ```
   *The server runs on [http://localhost:5000](http://localhost:5000)*

### 3. Frontend Setup
1. Open a terminal in the `client` folder:
   ```bash
   cd client
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client runs on [http://localhost:5173](http://localhost:5173)*

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/auth/register` | Register new student | No |
| `POST` | `/api/auth/login` | Authenticate & get JWT token | No |
| `GET` | `/api/auth/me` | Fetch currently logged-in user | Yes |
| `POST` | `/api/auth/logout` | User logout | No |
| `GET` | `/api/chats` | Get all chat sessions for user | Yes |
| `GET` | `/api/chats/:id` | Get single chat by ID | Yes |
| `POST` | `/api/chats` | Create new conversation | Yes |
| `POST` | `/api/chats/:id/messages` | Append message & get AI reply | Yes |
| `DELETE` | `/api/chats/:id` | Delete chat conversation | Yes |
| `GET` | `/api/summaries` | Get saved note summaries | Yes |
| `POST` | `/api/summaries` | Generate & store new summary | Yes |
| `DELETE` | `/api/summaries/:id` | Delete note summary | Yes |
| `GET` | `/api/quizzes` | Get list of user quizzes | Yes |
| `POST` | `/api/quizzes/generate` | Generate 4-option quiz | Yes |
| `PUT` | `/api/quizzes/:id/score` | Update & save quiz score | Yes |
| `DELETE` | `/api/quizzes/:id` | Delete quiz | Yes |
| `GET` | `/api/users/profile` | Get user profile & study statistics | Yes |
| `PUT` | `/api/users/profile` | Update user display name | Yes |
| `PUT` | `/api/users/password` | Update account password | Yes |

---

## 🎓 Interview & Portfolio Highlights

This project demonstrates core MERN and React software engineering concepts:
- **Clean MVC Architecture**: Controllers, models, routes, services, and middlewares cleanly separated.
- **Relational Data in MongoDB**: Foreign key references (`user` field referencing `User._id`) and embedded document arrays.
- **Stateful React Hooks**: Real-world usage of `useState`, `useEffect`, `useContext`, and `useRef`.
- **Stateless JWT Security**: Passwords salted and hashed with `bcryptjs`, verified via Authorization headers.
- **Fail-Safe AI Integration**: External API handling with zero downtime via an intelligent academic fallback engine.
