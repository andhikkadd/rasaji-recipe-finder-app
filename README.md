# Rasaji 1.0🍳

Rasaji is a modern, minimalist Indonesian recipe finder and cooking assistant. Discover daily meal ideas, filter recipes by category, bookmark your favorite dishes, and utilize a smart AI assistant to brainstorm recipe ideas from ingredients you already have at home.

---

## ✨ Features

- **Smart Search**: Find recipes by search queries matching recipe names or key ingredients.
- **Category Filter**: Effortlessly browse and filter daily menu options through an interactive category chip menu.
- **AI Ingredient Search**: Enter a list of ingredients from your kitchen, and our AI assistant (powered by Google Gemini) will recommend delicious recipes and outline cooking steps.
- **User Accounts & Favorites**: Register or sign in to save your favorite recipes (bookmarks) and like recipes permanently. Guests can still save bookmarks locally (`localStorage`).
- **Admin Dashboard**: A dedicated admin panel (`/admin`) to moderate recipes, review metadata, verify submissions, and manage web scraping or recipe ingestion.
- **Clean & Responsive UI**: A premium, minimalist light theme with elegant typography, smooth transitions, and hover effects optimized for mobile and desktop viewing.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** & **TypeScript**
- **Vite** (Next-generation frontend tooling)
- **React Router Dom** (Client-side routing)
- **Vanilla CSS** (Custom styling without the overhead of external CSS utility frameworks)

### Backend & Database
- **Node.js** & **Express.js** (REST API backend)
- **Prisma ORM** (Database schema management)
- **SQLite** (`better-sqlite3` for fast local development)
- **Express Session** & **Bcryptjs** (Secure session-based authentication)

### AI & Data Scraping
- **Google Gemini API** (Powered by `@google/genai` SDK)
- **Cheerio** (HTML parsing for custom web scraping scripts)

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Node.js** (v20 or higher recommended)
- **npm** or **yarn**

### Local Setup Instructions

1. **Install Dependencies**:
   Run the installation command directly from the repository root:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory and define the following variables:
   ```env
   DATABASE_URL="file:./dev.db"
   SESSION_SECRET="your_secure_random_session_secret"
   GEMINI_API_KEY="your_google_ai_studio_gemini_api_key"
   ```

3. **Initialize the Database**:
   Push the Prisma schema to create tables locally and run the seeding script:
   ```bash
   npx prisma db push
   node scripts/seed.js
   ```

4. **Run the Development Server**:
   Start the local development server (running Vite and the backend Express server concurrently):
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

5. **Build for Production**:
   Compile the frontend production assets:
   ```bash
   npm run build
   ```
