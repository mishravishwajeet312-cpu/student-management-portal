# Installation & Setup Guide

## 📋 Complete Setup & Deployment Instructions

### Part 1: Install & Run Locally

#### Step 1: Install Node.js
- Download from: https://nodejs.org/
- Choose the **LTS (Long Term Support)** version
- Install with default settings
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

#### Step 2: Navigate to Project Directory
```bash
cd "C:\Users\mishr\OneDrive\Desktop\Student-Table"
```

#### Step 3: Install Dependencies
```bash
npm install
```

This command will:
- Read `package.json`
- Download React, Vite, SheetJS, and other dependencies
- Create `node_modules` folder
- Generate `package-lock.json`

**Installation time: 2-5 minutes** (depends on internet speed)

#### Step 4: Start Development Server
```bash
npm run dev
```

**Expected output:**
```
  VITE v4.3.0  ready in 123 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

#### Step 5: Open in Browser
- The app will automatically open at http://localhost:3000
- If not, manually open that URL in your browser

#### Step 6: Test the Application

**Add a Student:**
1. Fill in Name, Email, and Age
2. Click "Add Student"
3. See the student appear in the table

**Edit a Student:**
1. Click "Edit" next to any student
2. Modify the information
3. Click "Update Student"

**Delete a Student:**
1. Click "Delete" next to any student
2. Confirm in the dialog
3. Student is removed

**Download Excel:**
1. Click "Download Excel" button
2. An Excel file downloads to your computer

#### Stop Development Server
- Press `Ctrl + C` in the terminal

---

### Part 2: Build for Production

#### Build Command
```bash
npm run build
```

**What happens:**
- Optimizes all code and assets
- Creates a `dist` folder with production-ready files
- Minimizes JavaScript and CSS
- **Output is in: `dist/` folder**

**Output should show:**
```
dist/index.html                  5.23 kB │ gzip:   2.03 kB
dist/assets/main-xxx.js        125.45 kB │ gzip:  42.30 kB
```

#### Preview Production Build
```bash
npm run preview
```

This starts a server to test your production build locally before deploying.

---

### Part 3: Deploy on Vercel (Easiest ⭐)

#### Step 1: Create GitHub Account
- Go to https://github.com
- Sign up for free account
- Verify email

#### Step 2: Create New Repository
- Click "+" icon → "New repository"
- Name: `student-table-crud`
- Choose "Private" or "Public"
- Click "Create repository"

#### Step 3: Push Project to GitHub

**Open Terminal in Project Folder** (or use VS Code terminal):

```bash
# Initialize git
git config --global user.name "Your Name"
git config --global user.email "your.email@gmail.com"

# Initialize repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Students CRUD app"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/student-table-crud.git

# Push to GitHub
git branch -M main
git push -u origin main
```

#### Step 4: Deploy on Vercel

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel
5. Click "New Project"
6. Select your `student-table-crud` repository
7. Click "Import"
8. Vercel auto-detects:
   - Project name: `student-table-crud`
   - Framework: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`
9. Click "Deploy"
10. Wait 2-3 minutes for deployment

**Your app is live at:** `https://student-table-crud-xxx.vercel.app/`

#### Step 5: Share Your App
- Share the Vercel URL with others
- Anyone can access it without installing anything
- Automatic deployments on every git push

---

### Part 4: Deploy on Netlify (Alternative)

#### Step 1: Push to GitHub
(Follow Part 3, Steps 1-3 above)

#### Step 2: Connect Netlify

1. Go to https://netlify.com
2. Click "Sign up"
3. Choose "Sign up with GitHub"
4. Authorize Netlify
5. Click "New site from Git"
6. Choose "GitHub"
7. Select your `student-table-crud` repository
8. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
9. Click "Deploy site"
10. Wait 2-3 minutes

**Your app is live at:** `https://your-site-name.netlify.app/`

#### Step 3: Custom Domain (Optional)
- Go to Site settings
- Click "Domain management"
- Add custom domain
- Follow DNS setup instructions

---

### Part 5: Deploy on GitHub Pages (Free)

#### Step 1: Update Package.json

Change this line in `package.json`:
```json
"homepage": "https://YOUR_USERNAME.github.io/student-table-crud"
```

#### Step 2: Build Project
```bash
npm run build
```

#### Step 3: Install GH-Pages
```bash
npm install --save-dev gh-pages
```

#### Step 4: Update package.json Scripts

Add these lines in the `"scripts"` section:
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

#### Step 5: Deploy
```bash
npm run deploy
```

#### Step 6: Enable GitHub Pages
- Go to your repository on GitHub
- Settings → Pages
- Choose `gh-pages` branch
- Your app is at: `https://YOUR_USERNAME.github.io/student-table-crud`

---

### Part 6: Troubleshooting

#### Issue: Port 3000 is Already in Use

**Solution:**
```bash
# Stop other processes on port 3000
# OR edit vite.config.js and change port to 3001
```

Edit `vite.config.js`:
```javascript
server: {
  port: 3001,  // Change this
  open: true
}
```

#### Issue: npm install Fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete old files
del package-lock.json
rmdir /s /q node_modules

# Reinstall
npm install
```

#### Issue: Excel Download Not Working

**Solution:**
```bash
# Ensure SheetJS is installed
npm install xlsx --save

# Restart dev server
npm run dev
```

#### Issue: Git Commands Not Recognized

**Solution:**
- Download Git from: https://git-scm.com/download/win
- Install with default settings
- Restart terminal/VS Code
- Try git commands again

#### Issue: "Permission Denied" or "Npm ERR!"

**Solution (Windows):**
```bash
# Run terminal as Administrator
# Then try npm commands again
```

---

### Part 7: Project Structure Overview

```
Student-Table/
│
├── src/                          # Source code
│   ├── components/
│   │   ├── StudentForm.jsx       # Form for add/edit
│   │   └── StudentTable.jsx      # Table display
│   ├── data/
│   │   └── students.js           # Initial data
│   ├── App.jsx                   # Main component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Styles
│
├── public/                       # Static files
├── dist/                         # Production build (created by npm run build)
├── node_modules/                 # Dependencies (created by npm install)
│
├── index.html                    # HTML file
├── vite.config.js               # Vite configuration
├── package.json                 # Dependencies & scripts
├── .gitignore                   # Files to ignore in git
└── README.md                    # Documentation
```

---

### Part 8: Environment Variables (Optional)

Create `.env` file in project root:

```env
VITE_APP_TITLE=Students Table CRUD
VITE_API_URL=http://localhost:3000
```

Access in code:
```javascript
console.log(import.meta.env.VITE_APP_TITLE)
```

---

### Part 9: Continuous Deployment

#### Vercel (Automatic)
- Push to GitHub branch
- Vercel automatically builds and deploys
- Deploying happens automatically after every commit to `main`

#### Netlify (Automatic)
- Push to GitHub branch
- Netlify automatically builds and deploys
- Each commit triggers a new deployment

#### GitHub Pages (Manual)
```bash
npm run deploy
```

---

### Part 10: Performance Optimization

#### For Production:

1. **Enable Compression:**
   - Most hosting (Vercel, Netlify) does this automatically

2. **Cache Busting:**
   - Vite handles this automatically with hash filenames

3. **Lazy Loading:**
   - Can be added later for larger apps

4. **CDN:**
   - Vercel and Netlify use global CDN automatically

---

### Part 11: Monitoring & Analytics (Optional)

#### Add Google Analytics:

1. Create account at: https://analytics.google.com
2. Get Tracking ID (starts with `G-`)
3. Add to `index.html` before closing `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-YOUR_TRACKING_ID');
</script>
```

---

### Part 12: Common Commands Reference

```bash
# Development
npm install           # Install dependencies
npm run dev          # Start dev server
npm run dev -- --port 3001  # Custom port

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Git/Deployment
git status          # Check git status
git add .           # Stage all files
git commit -m "message"  # Commit changes
git push            # Push to GitHub
npm run deploy      # Deploy to GitHub Pages
```

---

## ✅ Quick Start Checklist

- [ ] Node.js installed
- [ ] Project files ready
- [ ] `npm install` completed
- [ ] `npm run dev` started
- [ ] App opens at http://localhost:3000
- [ ] Can add/edit/delete students
- [ ] Excel download works
- [ ] Account created (GitHub/Vercel/Netlify)
- [ ] Project pushed to GitHub
- [ ] App deployed online
- [ ] Live URL accessible to others

---

## 📞 Need Help?

- **Vite Issues:** https://vitejs.dev/guide/troubleshooting.html
- **React Help:** https://react.dev
- **Deployment Issues:** Contact hosting support
- **Node.js Help:** https://nodejs.org/en/docs/

---

**Happy Deploying! 🎉**
