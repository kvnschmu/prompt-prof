# PromptCraft Pro

PromptCraft Pro ist ein professionelles, visuelles Prompt-Engineering-Tool für KI (Bilder & Texte). 
Die gesamte Anwendung ist containerisiert, PWA-ready und optimiert für Desktop und Mobile.

## 🚀 Features

- **Visual Prompt Builder**: Stelle komplexe Prompts per Knopfdruck ("Chips") zusammen (Motiv, Stil, Licht, Kamera, etc.)
- **AI Optimizer**: Automatische Verbesserung von einfachen Prompts in detaillierte Meisterwerke (via OpenAI/Gemini)
- **Image → Prompt**: Lade ein Bild hoch und die KI generiert den passenden Prompt dazu
- **Prompt Bibliothek**: Speichere, tagge und durchsuche deine besten Prompts
- **Verlauf**: Alle generierten und optimierten Prompts werden automatisch gespeichert
- **PWA Ready**: Kann als native App auf dem Smartphone oder Desktop installiert werden (Offline-Support)
- **Umbrella Theme**: Komplett gestaltetes Design System im Dark Mode (Glassmorphism, Gradients)

## 📦 Tech Stack

- **Frontend**: React (Vite), TypeScript, TailwindCSS v3, shadcn/ui Design System, Zustand (State), Framer Motion
- **Backend**: Node.js, Express, Prisma ORM
- **Datenbank**: SQLite (Dev) / PostgreSQL (Prod)
- **AI**: OpenAI & Google Gemini APIs

## 🛠️ Installation & Setup (Docker / Produktion)

Die Anwendung ist primär für das Deployment via Docker Compose und Cloudflare Tunnel konzipiert.

1. **Environment Variablen konfigurieren**
   Kopiere die `.env.example` zu `.env`:
   ```bash
   cp .env.example .env
   ```
   Füge deine API Keys (`OPENAI_API_KEY` oder `GEMINI_API_KEY`) und den `CLOUDFLARE_TUNNEL_TOKEN` ein.

2. **Docker Compose starten**
   ```bash
   docker compose up -d
   ```
   *Das Setup startet:*
   - `frontend` (nginx, serving static files)
   - `backend` (Node API + Prisma Migrate)
   - `db` (PostgreSQL)
   - `cloudflared` (Erstellt den sicheren Tunnel zu deiner Domain)

## 💻 Lokale Entwicklung

Ohne Docker arbeiten (nutzt automatisch SQLite anstatt Postgres):

1. **Backend starten**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   npm run dev
   ```

2. **Frontend starten**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Das Frontend ist nun unter `http://localhost:5173` erreichbar.

## 📱 PWA Features

Die Web App unterstützt PWA (Progressive Web App):
- Nutze das Menü deines Browsers (z.B. Chrome "Install PromptCraft Pro" / iOS "Zum Home-Bildschirm"), um die App nativ zu nutzen.
- Statische Assets und API-GET-Requests werden via Service Worker für eine schnellere Ladezeit und Offline-Ansicht der Bibliothek gecachet.
