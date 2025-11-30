# PDF-Export Feature

## Übersicht

Die PDF-Export-Funktionalität ermöglicht es, professionelle Versammlungsprotokolle als PDF-Datei zu exportieren. Dies ist sowohl für laufende Versammlungen (Entwurf) als auch für abgeschlossene Versammlungen verfügbar.

## Technologie

- **Puppeteer**: Headless Chrome für HTML-zu-PDF-Konvertierung
- **React Server Components**: Für das Rendering des HTML-Templates
- **Next.js API Routes**: Serverside PDF-Generierung

## Komponenten

### 1. PDF-Template (`meeting-pdf-template.tsx`)

Ein React-Komponente, die das HTML-Template für das PDF generiert. Enthält:

- **Briefkopf**: Firmenlogo, Kontaktdaten, Dokumenttitel
- **Versammlungsdetails**: Titel, Datum, Uhrzeit, Ort, Objekt
- **Versammlungsleitung**: Namen und Rollen
- **Teilnehmer**: Namen und Miteigentumsanteile (MEA)
- **Tagesordnung**: Alle TOP mit Beschreibungen
- **Abstimmungsergebnisse**: Ja/Nein/Enthaltungen mit MEA-Anteilen
- **Unterschriften**: Platzhalter für Versammlungsleiter und Protokollführer
- **Fußzeile**: Seitenzahl, Datum, Objektname

### 2. API Route (`/api/meetings/[id]/export-pdf/route.ts`)

Serverside Route, die:
1. Meeting-Daten aus der Datenbank lädt
2. HTML-Template rendert
3. Puppeteer startet und PDF generiert
4. PDF als Download zurückgibt

### 3. Export-Button in Meeting Detail Page

- Bei **abgeschlossenen** Versammlungen: "Als PDF exportieren"
- Bei **laufenden** Versammlungen: "Entwurf exportieren"

## Layout & Design

Das PDF folgt professionellen Dokumentenstandards:

- **Format**: DIN A4
- **Ränder**: 2.5cm oben, 2cm links/rechts, 3cm unten
- **Schriftart**: Helvetica/Arial
- **Schriftgröße**: 11pt Fließtext, 13pt Überschriften
- **Farben**: Blau (#2563eb) für Akzente, Schwarz für Text
- **Layout**: Grid-basiert für konsistente Ausrichtung

### Farbcodierung der Abstimmungen

- **Ja-Stimmen**: Grün (#16a34a)
- **Nein-Stimmen**: Rot (#dc2626)
- **Enthaltungen**: Grau (#6b7280)

## Verwendung

### Als Nutzer

1. Navigiere zu einer abgeschlossenen oder laufenden Versammlung
2. Klicke auf "Als PDF exportieren" bzw. "Entwurf exportieren"
3. Die PDF wird automatisch heruntergeladen

### Dateiname

Format: `Protokoll_[Objektname]_[Datum].pdf`

Beispiel: `Protokoll_Musterobjekt_2025-11-30.pdf`

## Anpassungen

### Briefkopf anpassen

Bearbeite die Briefkopf-Daten in `meeting-pdf-template.tsx`:

```tsx
<div className="company-name">
    Hausverwaltung Schmidt & Partner
</div>
<div className="company-details">
    Musterstraße 123 • 12345 Musterstadt
    <br />
    Tel: +49 (0) 123 456789 • ...
</div>
```

### Styling anpassen

Das CSS ist inline im `<style>`-Tag des Templates definiert. Wichtige CSS-Klassen:

- `.header`: Briefkopf-Bereich
- `.section`: Inhaltssektionen
- `.agenda-item`: Tagesordnungspunkte
- `.resolution`: Abstimmungsergebnisse
- `.footer`: Fußzeile

## Einschränkungen

### Puppeteer in Cloudflare Workers

Puppeteer funktioniert **nicht direkt** in Cloudflare Workers. Für Production Deployment gibt es folgende Optionen:

1. **Separate PDF-Service**: Eigener Server/Lambda für PDF-Generierung
2. **@cloudflare/puppeteer**: Cloudflare's eigene Puppeteer-Implementation
3. **Alternative Libraries**: 
   - `jsPDF` + `html2canvas` (clientseitig)
   - `@react-pdf/renderer` (leichtgewichtiger)
   - Externe API wie `html2pdf.app` oder `pdfcrowd`

### Empfehlung für Production

Für die aktuelle Cloudflare-Umgebung empfehle ich:

1. **Option A - Clientseitige Generierung**:
   - Wechsel zu `jsPDF` + `html2canvas`
   - PDF wird im Browser generiert
   - Keine Server-Ressourcen nötig

2. **Option B - Externe Service**:
   - API Route ruft externen PDF-Service auf
   - Z.B. `gotenberg`, `weasyprint`, oder kommerzielle Services

3. **Option C - Separate Lambda/Server**:
   - Eigener Serverless Function (AWS Lambda, Vercel, etc.)
   - Nur für PDF-Generierung
   - Von Cloudflare Workers angesprochen

## Zukünftige Verbesserungen

- [ ] Logo-Upload für Briefkopf
- [ ] Anpassbare Briefkopf-Daten im Admin-Bereich
- [ ] Auswahl zwischen verschiedenen Templates

## Testing

Für lokales Testing:

```bash
pnpm dev
```

Navigiere zu einer abgeschlossenen Versammlung und klicke auf "Als PDF exportieren".

**Hinweis**: Puppeteer lädt beim ersten Start Chrome herunter. Dies kann einige Minuten dauern.
