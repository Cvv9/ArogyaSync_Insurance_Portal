# ArogyaSync Insurance Portal — Specification & Reference

> **Last updated:** 2026-03-25
> Quick-reference document. Read this to get full context without scanning every source file.

---

## 1. Purpose

React SPA frontend for the Insurance Verification portal. Allows insurance company agents to register, log in, look up patients, run comprehensive fraud scans (CSV-vs-database vitals comparison), and view detailed mismatch results.

## 2. Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS 4 |
| Routing | react-router-dom 7 (HashRouter) |
| Icons | lucide-react |
| Testing | Vitest + Testing Library |
| Build | Vite |

## 3. Project Structure

```
ArogyaSync_Insurance_Portal/
├── src/
│   ├── App.jsx                # Root component with auth-protected routing
│   ├── api.js                 # API client with JWT auth, retry, AbortController
│   ├── main.jsx               # Entry point
│   ├── index.css              # Tailwind imports
│   ├── contexts/
│   │   └── AuthContext.jsx    # JWT auth state, token refresh, idle timeout
│   ├── components/
│   │   ├── LoginPage.jsx      # Agent login with email/password
│   │   ├── RegisterPage.jsx   # Agent registration with company selection
│   │   ├── VerifyEmail.jsx    # Email verification callback
│   │   ├── PatientLookup.jsx  # Patient search form (landing page)
│   │   ├── ScanResults.jsx    # Comprehensive scan results with filtering
│   │   ├── FraudResults.jsx   # Legacy fraud results view
│   │   ├── Dashboard.jsx      # Patient listing with modal detail
│   │   ├── Layout.jsx         # App shell with sidebar navigation
│   │   ├── ErrorBoundary.jsx  # React error boundary
│   │   └── DateInput.jsx      # Date input component
│   └── test/                  # Test setup and test files
├── public/
├── index.html                 # CSP meta tag, app mount point
├── vite.config.js
├── vitest.config.js
├── package.json
└── eslint.config.js
```

## 4. Routes

| Path | Component | Auth | Description |
|------|-----------|------|-------------|
| `/login` | LoginPage | Public only | Agent login |
| `/register` | RegisterPage | Public only | Agent registration |
| `/verify` | VerifyEmail | Public | Email verification callback |
| `/` | PatientLookup | Protected | Patient search (default landing) |
| `/patient-lookup` | PatientLookup | Protected | Patient search (alias) |
| `/scan-results` | ScanResults | Protected | Comprehensive scan results |
| `/results` | FraudResults | Protected | Per-device fraud results |
| `/dashboard` | Redirect to `/` | Protected | Legacy redirect |

## 5. Authentication

- **Model**: JWT Bearer token authentication against the Insurance Verification API
- **Login**: `POST /auth/login` with email + password, returns access + refresh tokens
- **Registration**: `POST /auth/register` with email, password, company, name
- **Token storage**: All tokens stored in memory only (React state/refs) — no localStorage/sessionStorage
- **Token refresh**: Proactive refresh 5 minutes before expiry via `/auth/refresh`
- **401 retry**: Failed requests automatically retry once after token refresh
- **Idle timeout**: 30-minute inactivity timeout triggers automatic logout
- **CSRF protection**: `X-Requested-With: XMLHttpRequest` header on all requests
- **Fetch timeout**: 15-second default AbortController timeout

> **Note**: Page refresh causes session loss (re-login required) since tokens are memory-only.

## 6. API Integration

Connects to Insurance Verification API (CSV Blob Checker backend):

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Agent login |
| `POST` | `/auth/register` | Agent registration |
| `POST` | `/auth/refresh` | Token refresh |
| `GET` | `/getAllpatients` | List patients (company-scoped) |
| `POST` | `/getPatientTest` | Patient fraud check results |
| `POST` | `/patient/comprehensive-scan` | Full CSV-vs-DB comparison |
| `GET` | `/health` | Backend health check |

All authenticated requests include `Authorization: Bearer <token>` header.

## 7. Build & Deploy

```bash
npm install
npm run dev              # Development server on :5173
npm run build            # Production build → dist/
npm test                 # Run Vitest tests
npm run lint             # ESLint
```

### Environment Variables

```env
VITE_API_BASE_URL=https://your-domain.com/checker
```

**Deployed to**: Hostinger shared hosting (`insurance.arogyasync.com`)
- Upload `dist/` contents to `public_html` via FTP
- HashRouter used — no server-side routing config needed

## 8. Security

- CSP meta tag in `index.html` (frame-ancestors 'none', XSS protections)
- No `dangerouslySetInnerHTML` usage anywhere in the codebase
- XSS prevention test coverage
- JWT tokens never persisted to storage
- AbortController cancellation on component unmount

## 9. Known Issues / Debt

- Page refresh loses auth session (tokens are memory-only, no sessionStorage persistence)
- No production error reporting service (ErrorBoundary catches but does not report)
- `.env.local.example` still references unused `VITE_API_KEY` variable (legacy artifact)
