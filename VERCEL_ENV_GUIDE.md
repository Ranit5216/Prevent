# How to Check Environment Variables in Vercel

## 📋 Method 1: Vercel Dashboard (Web Interface)

### Step-by-Step Instructions:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com
   - Log in with your account

2. **Select Your Project**
   - Click on your project name (e.g., "Prevent" or "PreEvent")

3. **Navigate to Settings**
   - Click on the **"Settings"** tab in the project navigation

4. **Open Environment Variables**
   - Click on **"Environment Variables"** in the left sidebar

5. **View All Variables**
   - You'll see a list of all environment variables
   - Each variable shows:
     - **Key** (variable name)
     - **Value** (hidden by default, click eye icon to reveal)
     - **Environment** (Production, Preview, Development)
     - **Created** date

### For Frontend (Client):
- Project: Your frontend project
- Path: `Settings → Environment Variables`
- Common variables:
  - `VITE_API_URL` or `REACT_APP_API_URL`
  - `VITE_APP_NAME`
  - Any Vite environment variables (must start with `VITE_`)

### For Backend (Server):
- Project: Your backend project (if separate)
- Path: `Settings → Environment Variables`
- Common variables:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `PORT`
  - `NODE_ENV`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - Email service credentials
  - Any other API keys

---

## 📋 Method 2: Vercel CLI

### Install Vercel CLI (if not installed):
```bash
npm install -g vercel
```

### Login to Vercel:
```bash
vercel login
```

### Link Your Project:
```bash
cd client  # For frontend
vercel link

# OR

cd server  # For backend
vercel link
```

### View Environment Variables:
```bash
# List all environment variables
vercel env ls

# View specific environment variable
vercel env pull .env.local
```

### Pull Environment Variables to Local:
```bash
# Pull all environment variables to a local file
vercel env pull .env.local

# Pull for specific environment
vercel env pull .env.local --environment=production
```

---

## 📋 Method 3: Check in Deployment Logs

1. Go to your project in Vercel Dashboard
2. Click on **"Deployments"** tab
3. Click on a specific deployment
4. Check the **"Build Logs"** or **"Runtime Logs"**
5. Environment variables are loaded during build (values are hidden for security)

---

## 🔍 What to Look For

### Frontend Environment Variables (Client):
- Variables must start with `VITE_` for Vite projects
- Example: `VITE_API_URL`, `VITE_APP_NAME`
- These are exposed to the browser (don't put secrets here!)

### Backend Environment Variables (Server):
- Database connection strings
- API keys and secrets
- JWT secrets
- Service credentials
- Port numbers

---

## ⚠️ Important Notes:

1. **Security**: Never commit `.env` files to Git (they're in `.gitignore`)
2. **Visibility**: Environment variable values are hidden by default in Vercel dashboard
3. **Scoping**: You can set different values for Production, Preview, and Development
4. **Updates**: After adding/updating variables, you need to redeploy

---

## 🛠️ Adding/Updating Environment Variables:

### Via Dashboard:
1. Go to `Settings → Environment Variables`
2. Click **"Add New"**
3. Enter:
   - **Key**: Variable name (e.g., `MONGODB_URI`)
   - **Value**: Variable value
   - **Environment**: Select Production/Preview/Development
4. Click **"Save"**
5. **Redeploy** your project for changes to take effect

### Via CLI:
```bash
# Add environment variable
vercel env add VARIABLE_NAME

# Remove environment variable
vercel env rm VARIABLE_NAME
```

---

## 📝 Quick Checklist:

- [ ] Frontend variables start with `VITE_`
- [ ] Backend variables are properly set
- [ ] Variables are scoped correctly (Production/Preview/Development)
- [ ] No sensitive data in frontend variables
- [ ] All required variables are present
- [ ] Redeployed after adding new variables

---

## 🔗 Useful Links:

- Vercel Dashboard: https://vercel.com/dashboard
- Vercel CLI Docs: https://vercel.com/docs/cli
- Environment Variables Docs: https://vercel.com/docs/concepts/projects/environment-variables

