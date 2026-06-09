# LabelGuard

**AI-powered TTB alcohol label compliance verification**

LabelGuard uses Claude Vision to automatically extract and validate required fields from alcohol beverage label images against Alcohol and Tobacco Tax and Trade Bureau (TTB) regulations, returning a structured compliance verdict in under 5 seconds.

---

## Background

TTB agents currently process approximately **150,000 alcohol label submissions per year** using a manual checklist process. Each label must be reviewed for a precise set of required fields, and the government warning statement must appear in a specific, regulated format. This manual workflow is time-intensive and prone to inconsistency.

LabelGuard replaces that process with a drag-and-drop interface backed by Claude Vision AI. Agents upload a label image, and the system returns a structured extraction of all required fields plus a PASS / WARNING / FAIL compliance verdict, targeting a **5-second response time** end to end.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React |
| Backend | Node.js + Express |
| AI / Vision | Anthropic Claude Vision API (`claude-opus-4-5`) |
| Deployment | Render (backend) + Vercel or static host (frontend) |

---

## Project Structure

```
labelguard/
├── client/               # Vite/React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadPanel.jsx   # Drag-and-drop image upload
│   │   │   └── ResultPanel.jsx   # Compliance result display
│   │   └── App.jsx
│   ├── .env.example      # Frontend environment variable reference
│   └── vite.config.js
└── server/               # Express API
    ├── routes/
    │   └── analyze.js    # Claude Vision call + compliance logic
    ├── index.js
    └── .env.example      # Server environment variable reference
```

---

## Setup

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/labelguard.git
cd labelguard
```

### 2. Configure the server

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and set your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
```

Install dependencies:

```bash
npm install
```

### 3. Configure the frontend

```bash
cd ../client
cp .env.example .env
```

For local development, `client/.env` should point to the local server:

```
VITE_API_URL=http://localhost:3001
```

For a deployed backend, set `VITE_API_URL` to your Render service URL before building.

Install dependencies:

```bash
npm install
```

---

## Running Locally

Open two terminals:

**Terminal 1 — backend**
```bash
cd server
node index.js
```

**Terminal 2 — frontend**
```bash
cd client
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Building for Production

```bash
cd client
VITE_API_URL=https://your-backend.onrender.com npm run build
```

The `dist/` folder can be deployed to Vercel, Netlify, or any static host. The backend deploys independently to Render or any Node.js host.

---

## Compliance Logic

### Required Fields

The following fields are extracted from each label image:

| Field | TTB Requirement |
|---|---|
| Brand Name | Must be present |
| Class / Type | Must be present |
| Alcohol Content | Must be present (ABV %) |
| Net Contents | Must be present (volume) |
| Country of Origin | Extracted only if explicitly stated |

### Verdict Rules

| Verdict | Condition |
|---|---|
| **PASS** | Government warning valid + all 4 required fields present |
| **WARNING** | Government warning valid + 1–2 required fields missing |
| **FAIL** | Government warning missing or invalid, OR 3+ required fields missing |

### Government Warning Validation

The government warning statement is subject to strict TTB format requirements. All four conditions below must be met for `format_valid: true`:

1. The warning must begin with exactly `GOVERNMENT WARNING:` in all caps
2. `GOVERNMENT WARNING:` must appear bold or visually emphasized
3. The text must contain **both** required health statements:
   - Risks to women during pregnancy (birth defects / health problems)
   - Impairment of driving and operating machinery
4. The font must not be so small as to be clearly intended to obscure the warning

If any condition fails, the system returns a `FAIL` verdict and describes the specific format issue.

### Image Quality Assessment

Claude also returns an image quality rating (`good` / `acceptable` / `poor`) with notes. A `poor` quality rating is surfaced in the results to flag that extracted values may be unreliable.

---

## Deployment Notes

### Render Free Tier — Cold Starts

The backend is deployed on Render's free tier, which **spins down after 15 minutes of inactivity**. The first request after a period of inactivity may take **30–60 seconds** while the service wakes up. Subsequent requests return to normal 3–5 second response times.

If consistent response times are required in production, upgrade to a paid Render instance or add an uptime ping service.

---

## Environment Variables Reference

### `server/.env`

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Required. Your Anthropic API key. |
| `PORT` | Port the Express server listens on. Defaults to `3001`. Render sets this automatically. |

### `client/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API. Use `http://localhost:3001` locally or your Render URL in production. |

---

## License

Internal use — Overwatch Cyber Group. Not for public distribution.

---

*Built by **Overwatch Cyber Group***
