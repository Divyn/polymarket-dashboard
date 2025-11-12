# Push to GitHub - Quick Guide

## Option 1: Create New Repository on GitHub (Recommended)

1. **Go to GitHub**:
   - Visit [github.com](https://github.com)
   - Sign in to your account

2. **Create New Repository**:
   - Click the "+" icon in the top right
   - Select "New repository"
   - Repository name: `polymarket-dashboard` (or any name you prefer)
   - Description: "Polymarket Dashboard - Next.js app for displaying market data"
   - Choose **Public** or **Private**
   - **DO NOT** check "Add a README file" (we already have one)
   - **DO NOT** check "Add .gitignore" (we already have one)
   - **DO NOT** check "Choose a license"
   - Click "Create repository"

3. **Copy the Repository URL**:
   - GitHub will show you the repository URL
   - It will look like: `https://github.com/YOUR_USERNAME/polymarket-dashboard.git`
   - Copy this URL

4. **Run these commands** (replace YOUR_USERNAME and REPO_NAME):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
   git push -u origin main
   ```

## Option 2: If You Already Have a Repository

If you already created a GitHub repository, just run:

```bash
# Replace with your actual repository URL
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

## After Pushing

Once pushed, you can:
- View your code on GitHub
- Deploy to Railway (see RAILWAY_DEPLOYMENT.md)
- Share the repository with others

## Troubleshooting

**Error: remote origin already exists**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

**Error: authentication required**
- GitHub may require a Personal Access Token instead of password
- Go to GitHub Settings → Developer settings → Personal access tokens
- Generate a new token with `repo` permissions
- Use the token as your password when pushing

**Error: branch name mismatch**
```bash
git branch -M main
git push -u origin main
```

