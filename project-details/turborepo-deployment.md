# Turborepo Deployment Guide

This guide covers deployment options for your Turborepo monorepo containing a Next.js frontend and NestJS backend.

## Table of Contents

1. [Deploy Entire Monorepo on One Platform (FREE)](#deploy-entire-monorepo-on-one-platform-free) ⭐ **START HERE**
2. [Can You Deploy on Vercel for Free?](#can-you-deploy-on-vercel-for-free)
3. [Vercel Deployment (Frontend Only)](#vercel-deployment-frontend-only)
4. [Alternative Free Deployment Options](#alternative-free-deployment-options)
5. [Recommended Free Deployment Strategy](#recommended-free-deployment-strategy)
6. [Step-by-Step Deployment Instructions](#step-by-step-deployment-instructions)

---

## Deploy Entire Monorepo on One Platform (FREE) ⭐

**Want to deploy your entire monorepo (frontend + backend) on a single platform for free?** Here are the best options with complete step-by-step guides.

### Quick Comparison

| Platform    | Free Tier          | Ease of Setup            | Performance               | Best For         |
| ----------- | ------------------ | ------------------------ | ------------------------- | ---------------- |
| **Railway** | ✅ $5/month credit | ⭐⭐⭐⭐⭐ Very Easy     | ⭐⭐⭐⭐⭐ Excellent      | **Recommended**  |
| **Render**  | ✅ Completely Free | ⭐⭐⭐⭐ Easy            | ⭐⭐⭐ Good (cold starts) | Budget-conscious |
| **Fly.io**  | ✅ Completely Free | ⭐⭐⭐ Moderate (Docker) | ⭐⭐⭐⭐ Very Good        | Docker users     |

---

### Option 1: Railway (Recommended) - Easiest & Best Performance

**Why Railway?**

- ✅ Deploys both frontend and backend from one repo
- ✅ $5 free credit per month (usually enough for small apps)
- ✅ Zero configuration needed - auto-detects your apps
- ✅ Excellent performance, no cold starts
- ✅ Automatic HTTPS and custom domains
- ✅ Easy environment variable management

**Total Cost:** $0/month (within free credit limit)

#### Step-by-Step Guide

##### Step 1: Prepare Your Repository

1. **Push your code to GitHub:**

   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

2. **Update CORS in Backend** (to allow requests from Railway frontend):

   Edit `apps/backend/src/main.ts`:

   ```typescript
   import { NestFactory } from "@nestjs/core";
   import { ValidationPipe } from "@nestjs/common";
   import { AppModule } from "./app.module";
   import { AllExceptionsFilter } from "./common/filters/http-exception.filter";

   async function bootstrap() {
     const app = await NestFactory.create(AppModule);

     app.setGlobalPrefix("api");

     app.useGlobalPipes(
       new ValidationPipe({
         whitelist: true,
         forbidNonWhitelisted: true,
         transform: true,
         transformOptions: {
           enableImplicitConversion: true,
         },
       }),
     );

     app.useGlobalFilters(new AllExceptionsFilter());

     // Enable CORS - Update this section
     app.enableCors({
       origin: [
         "http://localhost:3000",
         "http://127.0.0.1:3000",
         process.env.FRONTEND_URL, // Railway frontend URL
         process.env.NEXT_PUBLIC_VERCEL_URL, // Vercel if using
       ],
       credentials: true,
       methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
       allowedHeaders: ["Content-Type", "Authorization"],
     });

     const port = process.env.PORT || 3001;
     await app.listen(port);
     console.log(`✅ Backend is running on: http://localhost:${port}`);
   }
   bootstrap();
   ```

   Commit this change:

   ```bash
   git add apps/backend/src/main.ts
   git commit -m "Update CORS for production"
   git push origin main
   ```

##### Step 2: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Sign in with **GitHub**
4. Authorize Railway to access your repositories

##### Step 3: Deploy Backend

1. **Create New Project:**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Choose your repository

2. **Railway Auto-Detection:**
   - Railway will detect your backend automatically
   - If not detected, click **"New"** → **"GitHub Repo"**
   - Select your repository

3. **Configure Backend Service:**
   - Click on the service
   - Go to **Settings** tab
   - Set **Root Directory**: `apps/backend`
   - **Build Command**: `cd ../.. && pnpm install && pnpm --filter backend build`
   - **Start Command**: `cd apps/backend && pnpm start:prod`

4. **Set Environment Variables:**
   - Go to **Variables** tab
   - Add these variables:
     ```
     NODE_ENV=production
     PORT=3001
     MONGODB_URI=your_mongodb_connection_string
     FRONTEND_URL=https://your-frontend-service.up.railway.app
     ```
   - **Note:** You'll update `FRONTEND_URL` after deploying frontend

5. **Deploy:**
   - Railway automatically deploys on every push
   - Wait for deployment to complete (2-5 minutes)
   - Copy your backend URL (e.g., `https://your-backend-production.up.railway.app`)

##### Step 4: Deploy Frontend

1. **Add Frontend Service:**
   - In the same Railway project, click **"New"** → **"GitHub Repo"**
   - Select the same repository
   - Or click **"New"** → **"Service"** → **"GitHub Repo"**

2. **Configure Frontend Service:**
   - Go to **Settings** tab
   - Set **Root Directory**: `apps/frontend`
   - **Build Command**: `cd ../.. && pnpm install && pnpm --filter frontend build`
   - **Start Command**: `cd apps/frontend && pnpm start`

3. **Set Environment Variables:**
   - Go to **Variables** tab
   - Add:
     ```
     NODE_ENV=production
     NEXT_PUBLIC_API_URL=https://your-backend-production.up.railway.app
     ```
   - Replace with your actual backend URL from Step 3

4. **Update Backend CORS:**
   - Go back to your backend service
   - Update `FRONTEND_URL` variable with your frontend URL
   - Railway will automatically redeploy

5. **Deploy:**
   - Railway automatically deploys
   - Wait for deployment (3-7 minutes for first build)
   - Your frontend will be live!

##### Step 5: Configure Custom Domains (Optional)

1. **For Backend:**
   - Go to backend service → **Settings** → **Networking**
   - Click **"Generate Domain"** or add custom domain

2. **For Frontend:**
   - Go to frontend service → **Settings** → **Networking**
   - Click **"Generate Domain"** or add custom domain

**That's it!** Your entire monorepo is now deployed on Railway for free!

---

### Option 2: Render - Completely Free (No Credit Card)

**Why Render?**

- ✅ 100% free, no credit card needed
- ✅ Deploys both frontend and backend
- ✅ Automatic HTTPS
- ✅ Easy GitHub integration

**Limitations:**

- ⚠️ Services spin down after 15 minutes of inactivity
- ⚠️ Cold starts can take 30-60 seconds
- ⚠️ Limited resources on free tier

**Total Cost:** $0/month (completely free)

#### Step-by-Step Guide

##### Step 1: Prepare Your Repository

1. **Push your code to GitHub** (same as Railway Step 1)
2. **Update CORS** (same as Railway Step 1)

##### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with **GitHub**
3. Verify your email

##### Step 3: Deploy Backend

1. **Create New Web Service:**
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Click **"Connect"**

2. **Configure Backend:**
   - **Name**: `your-app-backend` (choose any name)
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `apps/backend`
   - **Build Command**: `cd ../.. && pnpm install && pnpm --filter backend build`
   - **Start Command**: `cd apps/backend && pnpm start:prod`

3. **Set Environment Variables:**
   - Scroll down to **"Environment Variables"**
   - Click **"Add Environment Variable"**
   - Add:
     ```
     NODE_ENV = production
     PORT = 10000
     MONGODB_URI = your_mongodb_connection_string
     FRONTEND_URL = https://your-app-frontend.onrender.com
     ```
   - **Note:** Update `FRONTEND_URL` after deploying frontend

4. **Deploy:**
   - Click **"Create Web Service"**
   - Wait for deployment (5-10 minutes first time)
   - Copy your backend URL (e.g., `https://your-app-backend.onrender.com`)

##### Step 4: Deploy Frontend

1. **Create New Web Service:**
   - Click **"New +"** → **"Web Service"**
   - Connect the same GitHub repository

2. **Configure Frontend:**
   - **Name**: `your-app-frontend`
   - **Environment**: `Node`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `cd ../.. && pnpm install && pnpm --filter frontend build`
   - **Start Command**: `cd apps/frontend && pnpm start`

3. **Set Environment Variables:**
   - Add:
     ```
     NODE_ENV = production
     NEXT_PUBLIC_API_URL = https://your-app-backend.onrender.com
     ```
   - Replace with your actual backend URL

4. **Update Backend CORS:**
   - Go to backend service → **Environment**
   - Update `FRONTEND_URL` with your frontend URL
   - Render will auto-redeploy

5. **Deploy:**
   - Click **"Create Web Service"**
   - Wait for deployment (5-10 minutes)
   - Your app is live!

**Note:** First request after 15 minutes of inactivity will be slow (cold start).

---

### Option 3: Fly.io - Free with Docker

**Why Fly.io?**

- ✅ Completely free tier
- ✅ No cold starts
- ✅ Global edge network
- ✅ Great performance

**Limitations:**

- ⚠️ Requires Docker knowledge
- ⚠️ More setup required
- ⚠️ Resource limits on free tier

**Total Cost:** $0/month (completely free)

#### Step-by-Step Guide

##### Step 1: Install Fly CLI

```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Or using Homebrew (macOS)
brew install flyctl

# Verify installation
fly version
```

##### Step 2: Sign Up

```bash
fly auth signup
```

Or sign up at [fly.io](https://fly.io)

##### Step 3: Deploy Backend

1. **Navigate to backend:**

   ```bash
   cd apps/backend
   ```

2. **Create Dockerfile** (`apps/backend/Dockerfile`):

   ```dockerfile
   FROM node:18-alpine AS base
   RUN npm install -g pnpm

   FROM base AS dependencies
   WORKDIR /app
   # Copy root package files
   COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
   # Copy backend package.json
   COPY apps/backend/package.json ./apps/backend/
   RUN pnpm install --frozen-lockfile

   FROM base AS build
   WORKDIR /app
   COPY --from=dependencies /app/node_modules ./node_modules
   # Copy all source files
   COPY . .
   WORKDIR /app/apps/backend
   RUN pnpm build

   FROM base AS runtime
   WORKDIR /app
   COPY --from=build /app/apps/backend/dist ./dist
   COPY --from=build /app/apps/backend/package.json ./
   COPY --from=build /app/node_modules ./node_modules
   EXPOSE 3001
   CMD ["node", "dist/main.js"]
   ```

   **Important:** This Dockerfile should be run from the **root** of your monorepo, not from `apps/backend`. Create a `.dockerignore` in root:

   ```
   node_modules
   .next
   dist
   .git
   .husky
   apps/frontend
   ```

3. **Initialize Fly.io from root:**

   ```bash
   cd ../..  # Go to monorepo root
   fly launch --config apps/backend/fly.toml
   ```

   - Choose app name (or let Fly generate)
   - Select region
   - Don't deploy yet (we'll configure first)

   **Note:** You need to run Fly commands from the root directory where the Dockerfile context is.

4. **Configure fly.toml:**
   Edit `apps/backend/fly.toml`:

   ```toml
   app = "your-backend-app-name"
   primary_region = "iad" # Change to your preferred region

   [build]

   [http_service]
     internal_port = 3001
     force_https = true
     auto_stop_machines = false
     auto_start_machines = true
     min_machines_running = 0
     processes = ["app"]

   [[vm]]
     cpu_kind = "shared"
     cpus = 1
     memory_mb = 256
   ```

5. **Set Secrets:**

   ```bash
   fly secrets set NODE_ENV=production --config apps/backend/fly.toml
   fly secrets set MONGODB_URI=your_mongodb_connection_string --config apps/backend/fly.toml
   fly secrets set FRONTEND_URL=https://your-frontend-app.fly.dev --config apps/backend/fly.toml
   ```

6. **Deploy:**
   ```bash
   fly deploy --config apps/backend/fly.toml --dockerfile apps/backend/Dockerfile
   ```

##### Step 4: Deploy Frontend

1. **Navigate to frontend:**

   ```bash
   cd ../frontend
   ```

2. **Create Dockerfile** (`apps/frontend/Dockerfile`):

   ```dockerfile
   FROM node:18-alpine AS base
   RUN npm install -g pnpm

   FROM base AS dependencies
   WORKDIR /app
   # Copy root package files
   COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
   # Copy frontend package.json
   COPY apps/frontend/package.json ./apps/frontend/
   RUN pnpm install --frozen-lockfile

   FROM base AS build
   WORKDIR /app
   COPY --from=dependencies /app/node_modules ./node_modules
   # Copy all source files
   COPY . .
   WORKDIR /app/apps/frontend
   RUN pnpm build

   FROM base AS runtime
   WORKDIR /app
   COPY --from=build /app/apps/frontend/.next ./.next
   COPY --from=build /app/apps/frontend/package.json ./
   COPY --from=build /app/node_modules ./node_modules
   COPY --from=build /app/apps/frontend/public ./public
   EXPOSE 3000
   CMD ["pnpm", "start"]
   ```

3. **Initialize Fly.io from root:**

   ```bash
   cd ../..  # Go to monorepo root
   fly launch --config apps/frontend/fly.toml
   ```

4. **Configure fly.toml:**

   ```toml
   app = "your-frontend-app-name"
   primary_region = "iad"

   [build]

   [http_service]
     internal_port = 3000
     force_https = true
     auto_stop_machines = false
     auto_start_machines = true
     min_machines_running = 0
     processes = ["app"]

   [[vm]]
     cpu_kind = "shared"
     cpus = 1
     memory_mb = 256
   ```

5. **Set Secrets:**

   ```bash
   fly secrets set NODE_ENV=production --config apps/frontend/fly.toml
   fly secrets set NEXT_PUBLIC_API_URL=https://your-backend-app.fly.dev --config apps/frontend/fly.toml
   ```

6. **Deploy:**

   ```bash
   fly deploy --config apps/frontend/fly.toml --dockerfile apps/frontend/Dockerfile
   ```

7. **Update Backend CORS:**
   ```bash
   fly secrets set FRONTEND_URL=https://your-frontend-app.fly.dev --config apps/backend/fly.toml
   fly deploy --config apps/backend/fly.toml --dockerfile apps/backend/Dockerfile
   ```

---

### Database Setup (Required for All Options)

You'll need a MongoDB database. Use **MongoDB Atlas** (free):

1. **Create Account:**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free

2. **Create Cluster:**
   - Click "Build a Database"
   - Choose **FREE (M0)** tier
   - Select region closest to your deployment
   - Click "Create"

3. **Configure Database:**
   - Go to **"Database Access"** → Create database user
   - Go to **"Network Access"** → Add IP `0.0.0.0/0` (allow all)
   - Go to **"Database"** → **"Connect"** → **"Connect your application"**
   - Copy connection string
   - Replace `<password>` with your password

4. **Add to Environment Variables:**
   - Add `MONGODB_URI` to your backend service

---

### Post-Deployment Checklist

After deploying, verify:

- [ ] Backend is accessible (visit backend URL in browser)
- [ ] Frontend is accessible (visit frontend URL)
- [ ] Frontend can connect to backend (check browser console)
- [ ] CORS is working (no CORS errors in console)
- [ ] Environment variables are set correctly
- [ ] Database connection is working
- [ ] API endpoints are responding
- [ ] HTTPS is enabled (automatic on all platforms)

---

### Troubleshooting

#### Backend Won't Start

1. **Check logs:**
   - Railway: Service → **Deployments** → Click deployment → **View Logs**
   - Render: Service → **Logs** tab
   - Fly.io: `fly logs`

2. **Common issues:**
   - Missing environment variables
   - Wrong build/start commands
   - Port mismatch (check PORT env var)

#### Frontend Can't Connect to Backend

1. **Check `NEXT_PUBLIC_API_URL`** is set correctly
2. **Verify backend URL** is accessible
3. **Check CORS** configuration in backend
4. **Check browser console** for errors

#### Database Connection Fails

1. **Verify MongoDB Atlas IP whitelist** includes `0.0.0.0/0`
2. **Check connection string** format
3. **Verify credentials** are correct

---

### Which Option Should You Choose?

**Choose Railway if:**

- ✅ You want the easiest setup
- ✅ You want best performance
- ✅ You don't mind $5 credit limit (usually enough)

**Choose Render if:**

- ✅ You want 100% free (no credit card)
- ✅ You don't mind cold starts
- ✅ You want simple setup

**Choose Fly.io if:**

- ✅ You're comfortable with Docker
- ✅ You want no cold starts
- ✅ You want global edge network

**Our Recommendation:** Start with **Railway** - it's the easiest and most reliable free option!

---

## Can You Deploy on Vercel for Free?

**Short Answer:** Partially yes, but with limitations.

**Details:**

- ✅ **Next.js Frontend**: Can be deployed on Vercel's free tier (Hobby plan)
- ⚠️ **NestJS Backend**: Vercel supports serverless functions, but NestJS is designed for long-running Node.js servers, not serverless. While it's technically possible to deploy NestJS on Vercel with modifications, it's **not recommended** and may have performance issues.

**Vercel Free Tier Limits:**

- 100GB bandwidth per month
- Unlimited serverless function executions
- 100 hours of serverless function execution time per month
- Automatic HTTPS
- Custom domains
- Preview deployments for every push

**Recommendation:** Deploy the frontend on Vercel and the backend on a platform better suited for Node.js applications (see alternatives below).

---

## Vercel Deployment (Frontend Only)

### Prerequisites

1. GitHub account
2. Vercel account (free)
3. Your code pushed to GitHub

### Step 1: Prepare Your Repository

1. **Push your code to GitHub:**

   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create a `.vercelignore` file** (optional, in root):
   ```
   node_modules
   .next
   dist
   .git
   .husky
   ```

### Step 2: Configure Vercel for Monorepo

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Click "Add New Project"**
3. **Import your GitHub repository**
4. **Configure the project:**
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `cd ../.. && pnpm install && pnpm --filter frontend build`
   - **Output Directory**: `apps/frontend/.next` (leave default or set to `.next`)
   - **Install Command**: `cd ../.. && pnpm install`

### Step 3: Set Environment Variables

In Vercel project settings, add environment variables:

- **`NEXT_PUBLIC_API_URL`**: Your backend API URL (e.g., `https://your-backend.railway.app` or `https://your-backend.render.com`)

**Note:** You'll need to deploy your backend first to get this URL.

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete
3. Your frontend will be live at `https://your-project.vercel.app`

### Step 5: Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

---

## Alternative Free Deployment Options

### Option 1: Railway (Recommended for Backend)

**Free Tier:**

- $5 credit per month (free)
- Pay-as-you-go after credit is used
- Great for Node.js applications
- Easy deployment from GitHub
- Automatic HTTPS
- Custom domains

**Limitations:**

- Credit expires monthly
- After $5 credit, charges apply (but very affordable)

**Best For:** Backend deployment

### Option 2: Render

**Free Tier:**

- Free web services (with limitations)
- Automatic HTTPS
- Custom domains
- Deploys from GitHub

**Limitations:**

- Services spin down after 15 minutes of inactivity
- Cold starts can be slow
- Limited resources

**Best For:** Backend deployment (if you can tolerate cold starts)

### Option 3: Fly.io

**Free Tier:**

- 3 shared-cpu VMs (256MB RAM each)
- 3GB persistent volume storage
- 160GB outbound data transfer
- Global edge network

**Limitations:**

- Resource limits
- Requires Docker configuration

**Best For:** Both frontend and backend (if you're comfortable with Docker)

### Option 4: Netlify (Frontend Only)

**Free Tier:**

- 100GB bandwidth per month
- 300 build minutes per month
- Automatic HTTPS
- Custom domains

**Best For:** Frontend deployment (alternative to Vercel)

### Option 5: MongoDB Atlas (Database)

**Free Tier:**

- 512MB storage
- Shared cluster
- Perfect for development and small projects

**Best For:** Database hosting (if your backend uses MongoDB)

---

## Recommended Free Deployment Strategy

### Strategy 1: Hybrid Approach (Recommended)

**Frontend:** Vercel (Free)

- Deploy Next.js app on Vercel
- Best performance and developer experience
- Automatic deployments from GitHub

**Backend:** Railway (Free $5 credit/month)

- Deploy NestJS app on Railway
- Better suited for Node.js applications
- Easy configuration

**Database:** MongoDB Atlas (Free)

- 512MB free tier
- Perfect for development

**Total Cost:** $0/month (within Railway's free credit)

### Strategy 2: All-in-One on Render

**Frontend:** Render (Free)

- Deploy Next.js app
- Acceptable performance

**Backend:** Render (Free)

- Deploy NestJS app
- May have cold starts

**Database:** MongoDB Atlas (Free)

**Total Cost:** $0/month

**Note:** Services spin down after inactivity, causing slow first requests.

### Strategy 3: All-in-One on Fly.io

**Frontend:** Fly.io (Free)

- Deploy Next.js app
- Requires Docker configuration

**Backend:** Fly.io (Free)

- Deploy NestJS app
- Requires Docker configuration

**Database:** MongoDB Atlas (Free)

**Total Cost:** $0/month

**Note:** Requires Docker knowledge and configuration.

---

## Step-by-Step Deployment Instructions

### Option A: Vercel (Frontend) + Railway (Backend) - Recommended

#### Part 1: Deploy Backend on Railway

1. **Create Railway Account:**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Backend Service:**
   - Railway will auto-detect your backend
   - If not, click "New Service" → "GitHub Repo"
   - Select your repo
   - Set **Root Directory**: `apps/backend`

4. **Configure Build Settings:**
   - **Build Command**: `cd ../.. && pnpm install && pnpm --filter backend build`
   - **Start Command**: `cd apps/backend && pnpm start:prod`
   - **Install Command**: `cd ../.. && pnpm install`

5. **Set Environment Variables:**
   - Go to **Variables** tab
   - Add your environment variables:
     - `PORT`: `3001` (or let Railway assign)
     - `NODE_ENV`: `production`
     - `MONGODB_URI`: Your MongoDB connection string (from MongoDB Atlas)

6. **Deploy:**
   - Railway will automatically deploy
   - Wait for deployment to complete
   - Copy your backend URL (e.g., `https://your-backend.railway.app`)

#### Part 2: Deploy Frontend on Vercel

1. **Follow Vercel steps above** (Step 2-5)
2. **Set Environment Variable:**
   - `NEXT_PUBLIC_API_URL`: Your Railway backend URL (e.g., `https://your-backend.railway.app`)

3. **Update Frontend API Client:**
   - Your frontend already uses `NEXT_PUBLIC_API_URL` environment variable
   - No code changes needed!

#### Part 3: Configure CORS (Backend)

Update your NestJS backend to allow requests from your Vercel frontend:

**File:** `apps/backend/src/main.ts`

```typescript
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: [
      "http://localhost:3000", // Local development
      process.env.FRONTEND_URL, // Production frontend URL
      "https://your-project.vercel.app", // Your Vercel URL
    ],
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
}
bootstrap();
```

**Add to Railway Environment Variables:**

- `FRONTEND_URL`: `https://your-project.vercel.app`

---

### Option B: Render (Both Frontend and Backend)

#### Part 1: Deploy Backend on Render

1. **Create Render Account:**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service:**
   - Click "New" → "Web Service"
   - Connect your GitHub repository

3. **Configure Backend:**
   - **Name**: `your-app-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd apps/backend && pnpm install && pnpm build`
   - **Start Command**: `cd apps/backend && pnpm start:prod`
   - **Root Directory**: `apps/backend`

4. **Set Environment Variables:**
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render default)
   - `MONGODB_URI`: Your MongoDB connection string

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment
   - Copy your backend URL

#### Part 2: Deploy Frontend on Render

1. **Create New Static Site:**
   - Click "New" → "Static Site"
   - Connect your GitHub repository

2. **Configure Frontend:**
   - **Name**: `your-app-frontend`
   - **Build Command**: `cd apps/frontend && pnpm install && pnpm build`
   - **Publish Directory**: `apps/frontend/.next`

3. **Set Environment Variables:**
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL

4. **Deploy:**
   - Click "Create Static Site"
   - Wait for deployment

**Note:** For Next.js on Render, you might need to use a Web Service instead of Static Site if you're using server-side features.

---

### Option C: Fly.io (Both Frontend and Backend)

#### Prerequisites

1. Install Fly CLI:

   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. Sign up: `fly auth signup`

#### Part 1: Deploy Backend

1. **Initialize Fly.io in Backend:**

   ```bash
   cd apps/backend
   fly launch
   ```

2. **Create Dockerfile** (if not exists):

   ```dockerfile
   FROM node:18-alpine AS base
   RUN npm install -g pnpm

   FROM base AS dependencies
   WORKDIR /app
   COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
   COPY apps/backend/package.json ./apps/backend/
   RUN pnpm install --frozen-lockfile

   FROM base AS build
   WORKDIR /app
   COPY --from=dependencies /app/node_modules ./node_modules
   COPY . .
   RUN pnpm --filter backend build

   FROM base AS runtime
   WORKDIR /app
   COPY --from=build /app/apps/backend/dist ./dist
   COPY --from=build /app/apps/backend/package.json ./
   COPY --from=build /app/node_modules ./node_modules
   EXPOSE 3001
   CMD ["node", "dist/main.js"]
   ```

3. **Deploy:**
   ```bash
   fly deploy
   ```

#### Part 2: Deploy Frontend

1. **Initialize Fly.io in Frontend:**

   ```bash
   cd apps/frontend
   fly launch
   ```

2. **Create Dockerfile:**

   ```dockerfile
   FROM node:18-alpine AS base
   RUN npm install -g pnpm

   FROM base AS dependencies
   WORKDIR /app
   COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
   COPY apps/frontend/package.json ./apps/frontend/
   RUN pnpm install --frozen-lockfile

   FROM base AS build
   WORKDIR /app
   COPY --from=dependencies /app/node_modules ./node_modules
   COPY . .
   RUN pnpm --filter frontend build

   FROM base AS runtime
   WORKDIR /app
   COPY --from=build /app/apps/frontend/.next ./.next
   COPY --from=build /app/apps/frontend/package.json ./
   COPY --from=build /app/node_modules ./node_modules
   EXPOSE 3000
   CMD ["pnpm", "--filter", "frontend", "start"]
   ```

3. **Set Environment Variables:**

   ```bash
   fly secrets set NEXT_PUBLIC_API_URL=https://your-backend.fly.dev
   ```

4. **Deploy:**
   ```bash
   fly deploy
   ```

---

## Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free
3. Create a new cluster (select free tier)

### Step 2: Configure Database

1. **Create Database User:**
   - Go to "Database Access"
   - Add new database user
   - Save username and password

2. **Configure Network Access:**
   - Go to "Network Access"
   - Add IP address: `0.0.0.0/0` (allow from anywhere)
   - Or add specific IPs for better security

3. **Get Connection String:**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password
   - Example: `<mongo uri>`

### Step 3: Add to Backend Environment Variables

Add `MONGODB_URI` to your backend deployment platform (Railway, Render, or Fly.io).

---

## Post-Deployment Checklist

- [ ] Backend is accessible and responding
- [ ] Frontend can connect to backend (check browser console)
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] Database connection is working
- [ ] HTTPS is enabled (automatic on most platforms)
- [ ] Custom domain is configured (optional)
- [ ] Error handling is working
- [ ] API endpoints are tested

---

## Troubleshooting

### Frontend Can't Connect to Backend

1. **Check CORS configuration** in backend
2. **Verify `NEXT_PUBLIC_API_URL`** is set correctly
3. **Check backend logs** for errors
4. **Verify backend URL** is accessible (try in browser)

### Backend Deployment Fails

1. **Check build logs** for errors
2. **Verify Node.js version** matches (>=18)
3. **Check environment variables** are set
4. **Verify build command** is correct

### Database Connection Issues

1. **Verify MongoDB Atlas IP whitelist** includes deployment platform IPs
2. **Check connection string** format
3. **Verify database user** credentials
4. **Check MongoDB Atlas cluster** is running

### Cold Starts (Render)

- Services spin down after 15 minutes of inactivity
- First request after spin-down will be slow
- Consider upgrading to paid plan or using Railway/Fly.io

---

## Cost Comparison

| Platform          | Free Tier          | Best For | Limitations             |
| ----------------- | ------------------ | -------- | ----------------------- |
| **Vercel**        | ✅ Yes             | Frontend | Backend not ideal       |
| **Railway**       | ✅ $5/month credit | Backend  | Credit expires monthly  |
| **Render**        | ✅ Yes             | Both     | Cold starts, spins down |
| **Fly.io**        | ✅ Yes             | Both     | Requires Docker         |
| **Netlify**       | ✅ Yes             | Frontend | Backend not ideal       |
| **MongoDB Atlas** | ✅ Yes             | Database | 512MB storage limit     |

---

## Summary

### Option 1: Deploy Entire Monorepo on One Platform (Recommended for Simplicity)

**Best Single-Platform Strategy:**

1. **Platform:** **Railway** (deploys both frontend + backend)
2. **Database:** **MongoDB Atlas** (free 512MB tier)

**Total Monthly Cost:** $0 (within Railway's $5 free credit)

**Why This is Best:**

- ✅ Deploy everything from one place
- ✅ Easiest setup (auto-detects your apps)
- ✅ Excellent performance, no cold starts
- ✅ Automatic HTTPS and custom domains
- ✅ Zero configuration needed

**Alternative Free Single-Platform Options:**

- **Render**: 100% free, but has cold starts
- **Fly.io**: 100% free, requires Docker setup

### Option 2: Hybrid Approach (Best Performance)

**Best Multi-Platform Strategy:**

1. **Frontend:** Deploy on **Vercel** (free, best performance)
2. **Backend:** Deploy on **Railway** (free $5 credit/month, easy setup)
3. **Database:** Use **MongoDB Atlas** (free 512MB tier)

**Total Monthly Cost:** $0 (within Railway's free credit)

**Why This is Best:**

- ✅ Best performance for frontend (Vercel's CDN)
- ✅ Best performance for backend (Railway's infrastructure)
- ✅ Optimized for each service type

**Both strategies provide:**

- ✅ Excellent performance
- ✅ Easy deployment and updates
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Zero cost (within limits)

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Fly.io Documentation](https://fly.io/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Turborepo Documentation](https://turbo.build/repo/docs)

---

**Last Updated:** 2024
