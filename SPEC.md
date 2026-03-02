# ArogyaSync CSV Checker Frontend — Specification & Reference

> **Last updated:** 2026-03-02
> Quick-reference document. Read this to get full context without scanning every source file.

---

## 1. Purpose

React SPA frontend for the Insurance/Fraud Detection portal. Allows insurance companies to look up patients and view CSV-vs-database comparison results from the CSV Blob Checker backend.

## 2. Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 7 |
| Styling | TailwindCSS |
| Build | Vite |

## 3. Project Structure

```
ArogyaSync_csv_checker_Frontend/
├── src/
│   ├── App.jsx              # Root component with routing
│   ├── App.css              # Styles
│   ├── main.jsx             # Entry point
│   ├── index.css
│   ├── components/          # Page components (Dashboard, Devices, Insurance, etc.)
│   └── assets/              # Static assets
├── public/
├── index.html
├── vite.config.js
├── package.json
└── eslint.config.js
```

## 4. Key Pages

- **Dashboard**: Overview of fraud detection status
- **Devices**: Device listing and status
- **Insurance**: Patient lookup and test result viewing

## 5. API Integration

Connects to CSV Blob Checker backend:
- `GET /getAllpatients` — List patients
- `POST /getPatientTest` — Patient fraud check results
- All requests include `X-API-Key` header

## 6. Build & Deploy

```bash
npm install
npm run dev              # Development server
npm run build            # Production build → dist/
```

### Environment Variables:
```env
VITE_API_BASE_URL=https://your-domain.com/csv
VITE_API_KEY=<csv-checker-api-key>
```

**Deployed to**: Hostinger shared hosting (`insurance.arogyasync.com`)
- Upload `dist/` contents to `public_html` via FTP
- Requires `.htaccess` for SPA routing

## 7. Known Issues / Debt

- No authentication/login screen for the insurance portal
- API key exposed in frontend environment variables
