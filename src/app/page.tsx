import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default async function HomePage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Versammlung",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description:
            "Moderne Software für Hausverwaltungen und WEG-Verwalter. Digitalisieren Sie Eigentümerversammlungen, Protokolle und Abstimmungen.",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            ratingCount: "127",
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Navigation />
            <div className="pt-16">
                <HeroSection />
                <FeaturesSection />
                <BenefitsSection />
                <CTASection />
                <Footer />
            </div>
        </>
    );
}
