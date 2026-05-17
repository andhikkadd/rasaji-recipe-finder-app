# Culinary Canvas 🍳

Culinary Canvas is a pristine, minimalist recipe finder application. Discover delicious meals, explore diverse cuisines by region, and save your favorite dishes to easily access them later.

## ✨ Features

- **Pristine Minimalist Design**: A beautifully crafted light theme with crisp typography and subtle glassmorphism/shadow effects.
- **Recipe Search**: Instantly find recipes from across the globe by searching for ingredients or dish names.
- **Region Filtering**: A dynamic, scrollable chip menu that allows you to filter recipes by origin (e.g., Indian, Canadian, Indonesian, etc.).
- **Popular Recipes**: Automatically presents a curated list of popular recipes upon loading.
- **Saved Recipes**: Click the heart icon on any recipe to save it to your local browser storage (`localStorage`). Access your favorites anytime in the "Saved" tab.
- **Detailed Recipe Modal**: View high-quality images, categorical badges, ingredients, exact measurements, step-by-step instructions, and YouTube tutorial links in a clean pop-up modal.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Vanilla CSS.
- **API**: [TheMealDB](https://www.themealdb.com/)
- **Deployment & DevOps**: Docker, Nginx, Google Cloud Run, Google Cloud Build (`cloudbuild.yaml` included).

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository and navigate to the project folder:
   ```bash
   cd recipe-finder
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## ☁️ Deployment (Google Cloud Run)

This project is configured for automated CI/CD deployment to **Google Cloud Run** using **Cloud Build** linked to a GitHub repository.

### Manual Setup Instructions:

1. **Push to GitHub**: Commit your code, including the `Dockerfile`, `nginx.conf`, and `cloudbuild.yaml`, and push it to your repository.
2. **Configure IAM Permissions**: In the Google Cloud Console, ensure your Cloud Build Service Account (ending in `@cloudbuild.gserviceaccount.com`) has the **Cloud Run Admin** and **Service Account User** roles.
3. **Set up a Trigger**: 
   - Navigate to **Cloud Build > Triggers**.
   - Create a new trigger connected to your GitHub repository.
   - Choose **Cloud Build configuration file (yaml or json)** as the configuration type and point it to the included `cloudbuild.yaml`.
4. **Deploy**: Push a new commit to your `main` branch to automatically trigger the build, or click **Run** manually in the Cloud Build console.

Once the build is complete, Google Cloud will provide you with a public HTTPS URL to access your deployed application.

---
*Powered by React and TheMealDB.*
