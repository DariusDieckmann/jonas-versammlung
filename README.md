# Jonas Versammlung

Next.js 15 Anwendung mit Cloudflare Workers, D1 Database, R2 Storage und Better Auth.

## 🚀 Lokales Setup

### 1. Prerequisites

- Node.js 20+
- pnpm
- Cloudflare Account
- Google OAuth App (für Login)
- Microsoft Azure App (optional, für Microsoft Login)

### 2. Installation

```bash
# Repository klonen
git clone <repository-url>
cd jonas-versammlung

# Dependencies installieren
pnpm install
```

### 4. Environment Variables (.dev.vars)

Erstelle `.dev.vars` im Root-Verzeichnis:

```bash
# Cloudflare Configuration
CLOUDFLARE_ACCOUNT_ID=deine-account-id
CLOUDFLARE_D1_TOKEN=dein-api-token
CLOUDFLARE_R2_URL=https://pub-xxxxx.r2.dev

# Better Auth
BETTER_AUTH_SECRET=generiertes-secret (siehe unten)
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=deine-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=dein-google-client-secret

# Microsoft OAuth (optional)
MICROSOFT_CLIENT_ID=deine-microsoft-client-id
MICROSOFT_CLIENT_SECRET=dein-microsoft-client-secret

# Email (optional - für Password Reset)
RESEND_API_KEY=dein-resend-api-key

# Environment
NEXTJS_ENV=development
```

### 5. Secrets generieren

**Better Auth Secret generieren:**
```bash
openssl rand -base64 32
```

### 7. Datenbank initialisieren

```bash
# TypeScript Types generieren
pnpm run cf-typegen

# Migrationen anwenden
pnpm run db:migrate:local

# Datenbank überprüfen
pnpm run db:inspect:local
```

### 8. Projekt starten

**Empfohlene Methode (2 Terminals):**

```bash
# Terminal 1: Wrangler für D1 Zugriff
pnpm run wrangler:dev

# Terminal 2: Next.js mit HMR
pnpm run dev
```

**Alternative (1 Terminal, kein HMR):**
```bash
pnpm run dev:cf
```

Öffne: http://localhost:3000

## 📋 Wichtige Befehle

### Development
```bash
pnpm dev                    # Next.js mit HMR starten
pnpm run wrangler:dev       # Wrangler für lokale D1 Datenbank
pnpm run dev:cf             # Build + Cloudflare Dev Server
pnpm run build:cf           # Für Cloudflare bauen
```

### Datenbank
```bash
pnpm run db:generate                    # Migration generieren
pnpm run db:generate:named "name"       # Benannte Migration
pnpm run db:migrate:local               # Zu lokal migrieren
pnpm run db:migrate:preview             # Zu preview migrieren
pnpm run db:migrate:prod                # Zu production migrieren
pnpm run db:studio:local                # Drizzle Studio öffnen
pnpm run db:inspect:local               # Tabellen anzeigen
pnpm run db:reset:local                 # Lokale DB zurücksetzen
```

### Deployment
```bash
pnpm run deploy                         # Production Deploy
pnpm run deploy:preview                 # Preview Deploy
```

### Secrets
```bash
pnpm run cf:secret                      # Secret hinzufügen
```

## 🔐 Production Secrets Setup

Für Production musst du die Secrets in Cloudflare setzen:

```bash
# Better Auth
echo "dein-secret" | wrangler secret put BETTER_AUTH_SECRET
echo "https://triple-d.ninja" | wrangler secret put BETTER_AUTH_URL

# Google OAuth
echo "deine-client-id" | wrangler secret put GOOGLE_CLIENT_ID
echo "dein-client-secret" | wrangler secret put GOOGLE_CLIENT_SECRET

# Microsoft OAuth (optional)
echo "deine-client-id" | wrangler secret put MICROSOFT_CLIENT_ID
echo "dein-client-secret" | wrangler secret put MICROSOFT_CLIENT_SECRET

# R2 URL (Production Custom Domain empfohlen)
echo "https://files.triple-d.ninja" | wrangler secret put CLOUDFLARE_R2_URL

# Resend (optional)
echo "re_xxxx" | wrangler secret put RESEND_API_KEY

# Environment
echo "production" | wrangler secret put NEXTJS_ENV
```

**Für Preview Environment:**
Füge `--env preview` zu jedem Befehl hinzu:
```bash
echo "dein-secret" | wrangler secret put BETTER_AUTH_SECRET --env preview
```

## 🏗️ Projekt-Struktur

```
src/
├── app/                     # Next.js App Router
│   ├── (auth)/             # Auth-Seiten (Login)
│   ├── api/                # API Routes
│   └── dashboard/          # Dashboard-Seiten
├── components/             # Shared UI Komponenten
├── db/                     # Datenbank-Konfiguration
├── modules/                # Feature-Module
│   ├── auth/              # Authentication
│   ├── dashboard/         # Dashboard
│   └── todos/             # Todo-Feature
└── services/              # Business-Logik Services
```

## 📚 Weitere Dokumentation

Detaillierte Dokumentation findest du in `documentation/`:
- `initial-documentation.md` - Vollständige technische Dokumentation
- `auth-security-setup.md` - Auth & Security Setup
- `deploy-complete.md` - Deployment Guide

## 🆘 Häufige Probleme

**Problem: D1 Database not found**
```bash
# Lösung: Migrations anwenden
pnpm run db:migrate:local
```

**Problem: TypeScript Fehler bei Cloudflare Bindings**
```bash
# Lösung: Types neu generieren
pnpm run cf-typegen
```

**Problem: Authentication funktioniert nicht**
- Prüfe ob alle OAuth Redirect URIs korrekt sind
- Prüfe ob `BETTER_AUTH_SECRET` gesetzt ist
- Prüfe ob `BETTER_AUTH_URL` zur aktuellen URL passt


---

**Tech Stack:** Next.js 15, Cloudflare Workers, D1 (SQLite), R2 Storage, Better Auth, Drizzle ORM, TailwindCSS 4
