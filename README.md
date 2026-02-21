# Porsche 911 Configurator

## Vercel Deploy Instructions

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Deploy via Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a Vite + React project

3. **Environment Variables**
   In Vercel dashboard, add this environment variable:
   ```
   VITE_API_URL=https://porsche-back.onrender.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be available at `.vercel.app`

### Automatic Deployment
After initial setup, every push to `main` branch will auto-deploy.

### Build Command
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Project Configuration
- Framework: Vite
- Build Tool: Vite
- Output: Static Site
