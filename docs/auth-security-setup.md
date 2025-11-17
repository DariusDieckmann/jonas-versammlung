# 🔐 Auth Security Setup - Aktueller Status

## 🎯 Aktuelles Setup

### **Authentication Library**
- **Better Auth** v1.3.9
- Session-basierte Authentifizierung
- Cookie-basierte Session-Verwaltung mit `nextCookies()`

### **Datenbank**
- **Cloudflare D1** (SQLite)
  - **Lokal**: `.wrangler/state/v3/d1/` (simulierte D1)
  - **Preview**: `jonas-versammlung-preview` (Remote)
  - **Production**: `jonas-versammlung-prod` (Remote)
- **ORM**: Drizzle ORM v0.44.5
- **SQL Injection Schutz**: Durch Drizzle automatisch

### **E-Mail-Versand**
- **Cloudflare MailChannels** (kostenlos!)
- Keine API Keys nötig
- Limit: 100 E-Mails/Tag
- Direkt in Cloudflare Workers integriert

### **Login-Methoden**
1. **Email + Password**
   - E-Mail-Verifikation: **Pflicht** ✅
   - Auto-Login nach Verifikation: **Nein** (manuelle Login-Pflicht)
2. **Google OAuth**
   - Auto-Login: Ja (bereits verifiziert durch Google)

---

## ✅ Aktive Sicherheitsfeatures

### 1. **E-Mail-Verifikation** ✅
- **Pflicht** für Email/Password-Registrierung
- Verifikations-E-Mail wird automatisch gesendet
- Login nur mit verifizierter E-Mail möglich
- Seiten:
  - `/verify-email` - Wartet auf Bestätigung
  - `/email-verified` - Bestätigung erfolgreich

### 2. **Passwort-Anforderungen** ✅
- Minimum: **8 Zeichen**
- Keine Komplexitäts-Anforderungen (flexibel)
- Beispiel gültige Passwörter: `password123`, `MeinPass1`, `12345678`

### 3. **Rate Limiting** ✅
- **5 Login-Versuche** pro 60 Sekunden
- Schutz vor Brute-Force-Attacken
- Implementiert via Better Auth

### 4. **Username-Validierung** ✅
- 3-30 Zeichen
- Nur: Buchstaben, Zahlen, `_` und `-`
- Keine Sonderzeichen oder Leerzeichen

### 5. **Password-Reset Flow** ✅
- Token-basierte Reset-Links
- E-Mail-Versand via MailChannels
- Sichere Implementierung

### 6. **Session Management** ✅
- Token-basierte Sessions
- IP-Adresse & User-Agent tracking
- Automatisches Session-Timeout

### 7. **CSRF-Schutz** ✅
- Via Better Auth + nextCookies()
- Automatisch implementiert

### 8. **HTTPS** ✅
- Erzwungen via Cloudflare
- Alle Verbindungen verschlüsselt

---

## 📧 E-Mail-Setup (Cloudflare MailChannels)

### Was ist MailChannels?
- ✅ **Kostenlos** (100 E-Mails/Tag)
- ✅ Direkt in Cloudflare Workers integriert
- ✅ **Keine API Keys** nötig
- ✅ **Keine Secrets** nötig
- ✅ Nur DNS-Konfiguration erforderlich

### DNS Records Setup (in Cloudflare Dashboard)

Gehe zu **Cloudflare Dashboard** → `triple-d.ninja` → **DNS** → **Records**

#### 1. SPF Record (E-Mail-Authentifizierung)
```
Type: TXT
Name: @
Content: v=spf1 a mx include:relay.mailchannels.net ~all
TTL: Auto
```

#### 2. DKIM Record (Spam-Schutz & Domain Lockdown)
```
Type: TXT
Name: _mailchannels
Content: v=mc1 cfid=jonas-versammlung-app.dari-darox.workers.dev
TTL: Auto
```

**Wichtig:** Worker-Name muss exakt mit deinem Cloudflare Worker übereinstimmen!

#### 3. DMARC Record (Optional, aber empfohlen)
```
Type: TXT
Name: _dmarc
Content: v=DMARC1; p=none; rua=mailto:dmarc@triple-d.ninja
TTL: Auto
```

### E-Mail-Absender
- **From**: `noreply@triple-d.ninja`
- **Name**: `Jonas Versammlung`
- Fest im Code konfiguriert, keine Secrets nötig

### Domain-Konfiguration (automatisch)
Die richtige Domain wird automatisch erkannt:
```typescript
Development:  http://localhost:3000
Preview:      https://preview-jonas-versammlung-app.dari-darox.workers.dev
Production:   https://triple-d.ninja
```

Keine manuellen Secrets oder Konfiguration nötig! ✅

---

## 🧪 Lokales Testing

### Development Mode
```bash
pnpm dev
```

**Was passiert:**
- E-Mails werden **nicht** versendet
- E-Mail-Inhalt wird in der **Console geloggt**
- Verifikations-Links können aus der Console kopiert werden
- Lokale D1-Datenbank (`.wrangler/state/`)

**Console-Output:**
```
📧 Email (Development Mode):
To: user@example.com
Subject: Verify your email address
HTML: <p>Click <a href="http://localhost:3000/api/auth/verify-email?token=...">here</a>...</p>
```

### Lokale Datenbank zurücksetzen
```bash
# Datenbank löschen
rm -rf .wrangler/state

# Migrationen neu anwenden
pnpm run db:migrate:local
```

---

## 🚀 Deployment

### Benötigte Cloudflare Secrets

```bash
# Auth Secret (bereits gesetzt)
npx wrangler secret put BETTER_AUTH_SECRET

# Google OAuth (bereits gesetzt)
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET

# R2 Storage (bereits gesetzt)
npx wrangler secret put CLOUDFLARE_R2_URL
```

**Keine E-Mail-Secrets nötig!** MailChannels funktioniert ohne API Keys. ✅

### Deployment Checklist

**Vor dem ersten Production-Deploy:**
- [ ] DNS Records in Cloudflare gesetzt (SPF, DKIM, DMARC)
- [ ] DNS-Propagation abwarten (5-60 Minuten)
- [ ] Cloudflare Secrets gesetzt (siehe oben)
- [ ] GitHub Actions Secrets gesetzt
- [ ] Code auf `main` Branch pushen

**Nach dem Deploy:**
1. **Test Registrierung**
   - Gehe zu `https://triple-d.ninja/signup`
   - Registriere dich mit echter E-Mail
   - Prüfe Posteingang (auch Spam!)
   - Klicke auf Verifikations-Link
   - Manuell einloggen

2. **Test Login ohne Verifikation**
   - Registriere zweiten Account
   - Versuche Login ohne E-Mail zu verifizieren
   - Sollte blockiert werden ✅

3. **Test Rate Limiting**
   - Versuche 6x falsch einzuloggen
   - Sollte nach 5 Versuchen blocken ✅

---

## 🔒 Sicherheits-Status

### ✅ Implementiert & Aktiv:
- [x] **E-Mail-Verifikation** (Pflicht, kein Auto-Login)
- [x] **Passwort-Mindestlänge** (8 Zeichen)
- [x] **Rate Limiting** (5 Versuche/60s)
- [x] **Password-Reset Flow** (Token-basiert)
- [x] **HTTPS** erzwungen (via Cloudflare)
- [x] **SQL Injection Schutz** (Drizzle ORM)
- [x] **Session Management** (Token + IP + User-Agent)
- [x] **CSRF-Schutz** (Better Auth + nextCookies)
- [x] **Username-Validierung** (3-30 Zeichen, alphanumerisch)
- [x] **Google OAuth** (als sichere Alternative)

### 📊 Security Level
**Aktuell:** ✅ **Production-Ready für normale Web-Apps**
- Geeignet für: Blogs, SaaS-Tools, Community-Plattformen
- Nicht geeignet für: Banking, Healthcare (2FA erforderlich)

### ⏳ Optional (für höhere Sicherheitsanforderungen):
- [ ] 2FA/MFA (Better Auth Plugin verfügbar)
- [ ] Stärkere Passwort-Komplexität (Groß-/Kleinbuchstaben, Zahlen, Sonderzeichen)
- [ ] Account Lockout nach X fehlgeschlagenen Versuchen
- [ ] E-Mail-Benachrichtigung bei Login von neuer IP
- [ ] Password-History (keine Wiederverwendung)
- [ ] Erweiterte Security Headers (CSP, HSTS)
- [ ] Audit Logging für kritische Aktionen

---

## 🆘 Troubleshooting

### E-Mails kommen nicht an (Production)

1. **DNS Records prüfen:**
   ```bash
   # SPF prüfen
   dig TXT triple-d.ninja
   
   # DKIM prüfen
   dig TXT _mailchannels.triple-d.ninja
   ```

2. **DNS-Propagation warten:**
   - Kann 5-60 Minuten dauern
   - Prüfe auf: https://dnschecker.org

3. **Spam-Ordner checken:**
   - Erste E-Mails landen oft in Spam
   - Markiere als "Kein Spam"

4. **Worker Logs checken:**
   ```bash
   npx wrangler tail
   ```
   Suche nach "Email sent" oder Fehlern

5. **MailChannels Status:**
   - Limit: 100 E-Mails/Tag
   - Bei Überschreitung: Warte bis nächsten Tag

### E-Mails werden lokal nicht in Console geloggt

Stelle sicher, dass `NODE_ENV=development` gesetzt ist (automatisch bei `pnpm dev`)

### Login funktioniert nicht nach Registrierung

- Hast du die E-Mail verifiziert?
- Klicke auf den Link in der E-Mail
- Lokal: Kopiere Link aus der Console

### Rate Limiting anpassen

In `src/modules/auth/shared/utils/auth-utils.ts`:
```typescript
rateLimit: {
    enabled: true,
    window: 60, // Sekunden
    max: 5,     // ← Hier anpassen
}
```

### Lokale DB zurücksetzen

```bash
rm -rf .wrangler/state
pnpm run db:migrate:local
```

### Cloudflare Secrets auflisten

```bash
# Alle Secrets anzeigen
npx wrangler secret list

# Secret setzen/überschreiben
npx wrangler secret put BETTER_AUTH_SECRET
```

---

## 📚 Weitere Ressourcen

- [Better Auth Docs](https://www.better-auth.com/docs)
- [Cloudflare MailChannels Docs](https://mailchannels.zendesk.com/hc/en-us/articles/4565898358413)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [OWASP Auth Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## 📊 Zusammenfassung

### Tech Stack
- **Auth**: Better Auth v1.3.9
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **Email**: Cloudflare MailChannels (kostenlos)
- **Deployment**: Cloudflare Workers
- **Framework**: Next.js 15 + OpenNext Cloudflare

### Kosten
- **Cloudflare Workers**: Kostenlos (Free Tier)
- **Cloudflare D1**: Kostenlos (Free Tier)
- **MailChannels**: Kostenlos (100 E-Mails/Tag)
- **Domain**: Bereits vorhanden
- **Gesamt**: €0/Monat ✅

### Setup-Zeit
- **DNS Records setzen**: 5 Minuten
- **DNS-Propagation**: 5-60 Minuten
- **Testing**: 10 Minuten
- **Gesamt**: ~20-75 Minuten (je nach DNS-Speed)

### Production-Ready?
✅ **Ja!** Für normale Web-Apps mit E-Mail-Verifikation und Rate Limiting
