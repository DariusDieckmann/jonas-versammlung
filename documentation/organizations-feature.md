# Organizations Feature Implementation

## Übersicht

Das Organizations-Feature ermöglicht es, Daten innerhalb einer Organisation zu teilen. Alle Mitglieder einer Organisation können auf die Ressourcen der Organisation zugreifen und diese verwalten - unabhängig davon, wer sie erstellt hat.

## Datenbank-Änderungen

### Neue Tabellen

1. **`organizations`** - Speichert Organisationen
   - `id` (PK, AutoIncrement)
   - `name` - Name der Organisation
   - `description` - Optionale Beschreibung
   - `created_by` (FK zu `user`) - Ersteller der Organisation
   - `created_at`, `updated_at`

2. **`organization_members`** - Verknüpfungstabelle für Mitglieder
   - `id` (PK, AutoIncrement)
   - `organization_id` (FK zu `organizations`)
   - `user_id` (FK zu `user`)
   - `role` - Rolle des Mitglieds ('owner' oder 'member')
   - `joined_at`

## Migration

Die Migration (`0002_add_organizations.sql`) führt folgende Schritte durch:

1. Erstellt neue Tabellen `organizations` und `organization_members`
2. Erstellt automatisch eine persönliche Organisation für jeden bestehenden User
3. Entfernt die alten Tabellen und benennt die neuen um


## API / Actions

### Organization Actions

**`/src/modules/organizations/shared/organization.action.ts`**

- `getUserOrganizations()` - Alle Organisationen des Users abrufen
- `getOrganization(organizationId)` - Eine spezifische Organisation abrufen
- `createOrganization(data)` - Neue Organisation erstellen
- `updateOrganization(organizationId, data)` - Organisation aktualisieren (nur Owners)
- `deleteOrganization(organizationId)` - Organisation löschen (nur Owners)
- `getOrganizationMembers(organizationId)` - Alle Mitglieder abrufen
- `addOrganizationMember(organizationId, email, role)` - Mitglied hinzufügen (nur Owners)
- `removeOrganizationMember(organizationId, userId)` - Mitglied entfernen (nur Owners)
- `isOrganizationMember(organizationId)` - Prüfen ob User Mitglied ist

## Berechtigungsmodell

### Rollen

- **Owner** - Kann Organisation bearbeiten/löschen und Mitglieder verwalten
- **Member** - Kann auf alle Ressourcen innerhalb der Organisation zugreifen

### Berechtigungen

**Alle Mitglieder (Owner + Member) können:**
- ✅ Auf alle Ressourcen der Organisation zugreifen
- ✅ Alle Daten der Organisation sehen

**Nur Owners können:**
- 🔒 Organisation-Details bearbeiten
- 🔒 Organisation löschen
- 🔒 Mitglieder hinzufügen/entfernen
- 🔒 Rollen von Mitgliedern ändern

## Schema-Dateien

```
src/
  modules/
    organizations/
      shared/
        schemas/
          organization.schema.ts      # Drizzle Schemas & Zod Validation
        models/
          organization.model.ts       # TypeScript Types & Interfaces
        organization.action.ts        # Server Actions
```

## Nächste Schritte

Um das Feature komplett zu integrieren, können noch folgende UI-Komponenten erstellt/angepasst werden:

1. **Organization Selector** - Dropdown zur Auswahl der aktiven Organisation
2. **Organization Settings** - Seite zur Verwaltung von Organisationen ✅ (bereits implementiert)
3. **Member Management** - UI zum Hinzufügen/Entfernen von Mitgliedern ✅ (bereits implementiert)
4. **Weitere Features** - Je nach Anforderung

### Beispiel: Organization Context/State

```typescript
// Könnte als React Context oder Zustand gespeichert werden
const [currentOrganizationId, setCurrentOrganizationId] = useState<number>();

// Beim Laden von Daten
const data = await getData(currentOrganizationId);

// Beim Erstellen von Ressourcen
formData.append("organizationId", currentOrganizationId.toString());
```

## Technische Details

- **Framework**: Next.js 15 (App Router)
- **ORM**: Drizzle ORM
- **Database**: SQLite (Cloudflare D1)
- **Validation**: Zod
- **Auth**: better-auth

## Hinweise

- Bei der Migration werden automatisch persönliche Organisationen für alle existierenden User erstellt
- Alle Mitglieder haben gleichberechtigten Zugriff auf Ressourcen innerhalb der Organisation
- Das Löschen einer Organisation löscht automatisch alle zugehörigen Daten (CASCADE)
- Member Management (Hinzufügen, Entfernen, Rollen ändern) ist für Owners verfügbar
