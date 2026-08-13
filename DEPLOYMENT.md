# 🚀 Full Stack Deployment Guide: Zoom Clone

This guide explains how to deploy both the **FastAPI Backend (with WebSockets & SQLite)** and the **Next.js Frontend (with Clerk & WebRTC)** for free so you can showcase your live application anywhere.

---

## 🏗️ Architecture Overview

| Component | Platform | Protocol / Tech |
| :--- | :--- | :--- |
| **Backend API & WebSockets** | [Render](https://render.com) (or Railway) | Python 3.12, FastAPI, SQLite, WebSockets (`/ws/meeting/{id}`) |
| **Frontend Web App** | [Vercel](https://vercel.com) | Next.js 16 (App Router), React, Clerk Auth, WebRTC Mesh |

---

## 📦 Part 1: Deploy FastAPI Backend on Render (Free)

Render provides free hosting with full persistent WebSocket support.

### Step 1: Create a New Web Service
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository: `https://github.com/KAILASH-C12/Zoom-clone`.

### Step 2: Configure Service Settings
- **Name**: `zoom-clone-backend` (or any preferred name)
- **Region**: Nearest to your users (e.g. *Singapore* or *Oregon*)
- **Branch**: `main` (or `master`)
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Instance Type**: Free

### Step 3: Deploy & Save URL
1. Click **Create Web Service**.
2. Once the deploy succeeds, copy your live backend URL (e.g., `https://zoom-clone-backend.onrender.com`).
3. Verify by visiting `https://zoom-clone-backend.onrender.com/api/health` in your browser. You should receive `{"status":"ok","service":"zoom-clone-api"}`.

---

## ⚡ Part 2: Deploy Next.js Frontend on Vercel (Free)

### Step 1: Import Project to Vercel
1. Log in to [Vercel Dashboard](https://vercel.com/).
2. Click **Add New...** → **Project**.
3. Select your `Zoom-clone` repository.

### Step 2: Configure Environment Variables
In the **Environment Variables** section on Vercel, add the following variables:

| Variable Name | Value / Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Your Clerk Publishable Key | `pk_test_...` |
| `CLERK_SECRET_KEY` | Your Clerk Secret Key | `sk_test_...` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign In Route | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign Up Route | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Redirect Route | `/` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Redirect Route | `/` |
| `NEXT_PUBLIC_API_URL` | Your Render Backend URL | `https://zoom-clone-backend.onrender.com` |

*(Make sure there is no trailing slash on `NEXT_PUBLIC_API_URL`)*

### Step 3: Deploy
1. Click **Deploy**.
2. In ~1-2 minutes, Vercel will give you a live production URL (e.g., `https://zoom-clone-xxx.vercel.app`).

---

## 🔒 Part 3: Configure Clerk Allowed Domains

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com/).
2. Select your application (`app_3HrY2B8UrMbUSHOPL75Nr2aHAu8`).
3. Under **Configure** → **Domains / Paths**, add your live Vercel domain (`https://zoom-clone-xxx.vercel.app`) to allowed origins.

---

## ✨ Live Showcase Checklist

- [x] WebRTC mesh video calling between multiple tabs / devices
- [x] Real-time screen sharing broadcasted to remote participants
- [x] In-meeting CRDT synchronized chat & floating reactions
- [x] Dynamic user profile & guest mode
- [x] Team chat tab with meeting link sharing cards
- [x] Dark glassmorphic workspace UI & meeting scheduler
