import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
    display: "swap",
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Versammlung - Digitale Hausverwaltung & Eigentümerversammlungen",
    description:
        "Moderne Software für Hausverwaltungen und WEG-Verwalter. Digitalisieren Sie Eigentümerversammlungen, Protokolle und Abstimmungen. DSGVO-konform, effizient und rechtssicher.",
    keywords: [
        "Hausverwaltung",
        "Eigentümerversammlung",
        "WEG Verwaltung",
        "digitale Hausverwaltung",
        "Versammlungsmanagement",
        "Protokollverwaltung",
        "WEG Software",
        "Eigentümer Software",
        "digitale Abstimmung",
        "Hausverwaltungssoftware",
        "DSGVO konform",
        "Digitalisierung Hausverwaltung",
    ],
    authors: [{ name: "Versammlung" }],
    openGraph: {
        type: "website",
        locale: "de_DE",
        url: "https://triple-d.ninja",
        title: "Versammlung - Digitale Hausverwaltung & Eigentümerversammlungen",
        description:
            "Moderne Software für Hausverwaltungen und WEG-Verwalter. Digitalisieren Sie Eigentümerversammlungen effizient und rechtssicher.",
        siteName: "Versammlung",
    },
    twitter: {
        card: "summary_large_image",
        title: "Versammlung - Digitale Hausverwaltung",
        description:
            "Moderne Software für Hausverwaltungen und WEG-Verwalter. DSGVO-konform und rechtssicher.",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="de">
            <head>
                <link rel="canonical" href="https://triple-d.ninja" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
            >
                <Providers>
                    <main>{children}</main>
                </Providers>
            </body>
        </html>
    );
}
