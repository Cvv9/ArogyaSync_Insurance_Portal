# CI/CD Setup for Insurance Portal

## Overview

The Insurance Portal uses **GitHub Secrets** for secure environment variable management in CI/CD pipelines.

## GitHub Secrets Configuration

Go to: **Repository Settings → Secrets and variables → Actions → New repository secret**

Add the following secrets:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `VITE_API_KEY` | API key for Insurance Verification API | `709f39e0b561...` |
| `FTP_SERVER` | Hostinger FTP server | `ftp.yourdomain.com` |
| `FTP_USERNAME` | Hostinger FTP username | `your_username` |
| `FTP_PASSWORD` | Hostinger FTP password | `your_password` |

## Deployment Workflow

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:

1. **Triggers on push to `main`** or manual dispatch
2. **Builds the app** with secrets injected as environment variables
3. **Deploys to Hostinger** via FTP

## Local Development

For local development:

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local with your actual API key
# .env.local is gitignored and will not be committed
```

## Environment Variable Hierarchy

1. **`.env`** (committed) — Non-sensitive defaults only
2. **`.env.local`** (gitignored) — Local development secrets
3. **GitHub Secrets** (CI/CD) — Production secrets injected at build time

## Manual Deployment

To deploy manually:

```bash
# Build with environment variables
VITE_API_KEY=your-key-here npm run build

# Upload dist/ folder to Hostinger via FTP/File Manager
```

## Security Notes

- ✅ API key is bundled into static JS files (exposed to browser)
- ✅ Server-side validation happens in Insurance Verification API
- ✅ No sensitive backend credentials in frontend
- ❌ Never commit `.env.local` to git
- ❌ Never hardcode secrets in source code
