import { LandingFooter } from "@/components/public/public-footer";
import { Navigation } from "@/components/public/public-navigation";
import { BenefitsSection } from "@/modules/landing/benefits-section";
import { CTASection } from "@/modules/landing/cta-section";
import { FeaturesSection } from "@/modules/landing/features-section";
import { HeroSection } from "@/modules/landing/hero-section";

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
                <LandingFooter />
            </div>
        </>
    );
}
