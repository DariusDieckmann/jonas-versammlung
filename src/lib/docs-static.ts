export const DOCS_DATA = {
  "eigene-organisation": [
    {
      slug: "erste-schritte",
      title: "Erste Schritte",
      description: "Der komplette Workflow - von der Anmeldung bis zur fertigen Versammlung",
      order: 0,
    },
    {
      slug: "registrierung-und-einrichtung",
      title: "Registrierung und Einrichtung",
      description: "Melden Sie sich an und legen Sie los",
      order: 1,
    },
    {
      slug: "organisation-erstellen",
      title: "Organisation erstellen",
      description: "Legen Sie Ihre erste Organisation an und verwalten Sie Ihre Verwaltung",
      order: 2,
    },
    {
      slug: "mitglieder-einladen",
      title: "Mitglieder einladen",
      description: "Laden Sie Teammitglieder in Ihre Organisation ein",
      order: 3,
    },
  ],
  "liegenschaften": [
    {
      slug: "liegenschaft-erstellen",
      title: "Liegenschaft erstellen",
      description: "Fügen Sie Ihre erste Immobilie hinzu",
      order: 1,
    },
    {
      slug: "einheiten-und-eigentuemer",
      title: "Einheiten und Eigentümer verwalten",
      description: "Verwalten Sie Wohneinheiten und deren Eigentümer",
      order: 2,
    },
  ],
  "versammlungen": [
    {
      slug: "versammlung-erstellen",
      title: "Versammlung erstellen",
      description: "Planen Sie Ihre erste Eigentümerversammlung in wenigen Schritten",
      order: 1,
    },
    {
      slug: "versammlung-durchfuehren",
      title: "Versammlung durchführen",
      description: "Führen Sie eine Versammlung Schritt für Schritt durch",
      order: 2,
    },
    {
      slug: "protokolle-einsehen",
      title: "Protokolle einsehen",
      description: "Sehen Sie sich Versammlungsprotokolle und Beschlüsse an",
      order: 3,
    },
  ],
} as const;

export const CATEGORY_INFO = {
  "eigene-organisation": {
    title: "Eigene Organisation",
    description: "Verwalten Sie Ihre Organisation, Mitglieder und Einstellungen",
    icon: "PlayCircle",
  },
  "liegenschaften": {
    title: "Liegenschaften",
    description: "Legen Sie Liegenschaften, Einheiten und Eigentümer an",
    icon: "Building2",
  },
  "versammlungen": {
    title: "Versammlungen",
    description: "Erstellen und führen Sie Versammlungen durch",
    icon: "Calendar",
  },
} as const;
