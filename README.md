# Intrusion — Cybersecurity Quiz Platform

Intrusion is a high-performance, real-time quiz application built with Next.js 14. It is designed for cybersecurity training scenarios, featuring a "Red & Black" hacker-themed UI, live leaderboards, and an admin dashboard for creating and managing quizzes.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18.17.0 or later)
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shivamborn2shine/Quiz_Platform.git
   cd Quiz_Platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

This project uses the Next.js App Router structure.

```
quiz-platform/
├── src/
│   ├── app/                    # App Router (Pages & API)
│   │   ├── admin/              # Admin Dashboard pages
│   │   ├── api/                # Backend API Routes
│   │   ├── quiz/               # Student Quiz Interface
│   │   ├── globals.css         # Global Styles & Theme Variables
│   │   └── page.tsx            # Landing Page / Access Portal
│   ├── components/             # Reusable React Components
│   │   ├── ui/                 # Shadcn/UI primitive components (Card, Button, Input)
│   │   └── LiveLeaderboard.tsx # Real-time leaderboard component
│   ├── lib/                    # Utility functions & Database logic
│   │   ├── db.ts               # File-system database handler (JSON storage)
│   │   └── utils.ts            # CSS class merging utility
│   └── types/                  # TypeScript interfaces (Quiz, Question, etc.)
├── data/                       # Local Data Storage (JSON files)
│   ├── quizzes.json            # Stored quizzes content
│   └── results.json            # Stored student results
├── public/                     # Static assets
├── .gitignore                  # Git ignore rules
└── package.json                # Project dependencies
```

## ✨ Features

### 🛡️ Student Interface
- **Access Code System**: Join quizzes using a unique code (e.g., `SEC101`).
- **Interactive Quizzes**: Multiple-choice and text-input questions.
- **Real-Time Score**: Instant feedback on points earned.
- **Responsive Design**: Optimized for desktop and mobile.

### 🔐 Admin Dashboard
- **Authentication**: Secure admin login area.
- **Quiz Builder**: Create quizzes with custom titles, descriptions, and specific point values.
- **Image Support**: Upload or link images for questions.
- **Results View**: Monitor student progress and view live rankings.

### 🎨 Theme & UI
- **Red & Black Theme**: Custom CSS setup in `src/app/globals.css`.
- **Animations**: Subtle zoom/fade animations for a premium feel.
- **Shadcn/UI**: Built with accessible, high-quality component primitives.

---

## 📡 API Routes

The application uses Next.js Route Handlers (serverless functions) found in `src/app/api/`:

- **`GET /api/quizzes`**: Fetch all available quizzes.
- **`POST /api/quizzes`**: Create a new quiz (Admin only).
- **`POST /api/results`**: Submit quiz results and update scores.
- **`POST /api/admin/login`**: Verify admin credentials.
- **`POST /api/upload`**: Handle image uploads for questions.

---

## 💾 Data Persistence

**Important:** This application currently uses a **local file-system database**.
- Data is stored in: `data/quizzes.json` and `data/results.json`.
- **Deployment Warning:** If you deploy this to Vercel, Netlify, or AWS Lambda, the local file system is **ephemeral**. This means your saved quizzes and results **will disappear** every time you redeploy the app.
- **Recommendation:** For a permanent deployment, replace `src/lib/db.ts` with a cloud database connection (e.g., MongoDB, PostgreSQL, or Firebase).

---

## 🛠️ Development & Customization

### Modifying the Theme
The visual theme is controlled via CSS variables in `src/app/globals.css`.
- **`--primary`**: Controls the main red accent color.
- **`--background`**: Controls the deep black background color.

### Adding New Components
1. Create the component in `src/components/`.
2. If using Shadcn/UI primitives, place them in `src/components/ui/`.
3. Export and import them as needed in your pages.

---

## 📦 Deployment

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deploy"
   git push origin main
   ```

2. **Deploy on Vercel**:
   - Go to [Vercel](https://vercel.com).
   - "Add New Project" -> Import your `Quiz_Platform` repo.
   - Click **Deploy**.

*(Remember the note about Data Persistence above!)*
