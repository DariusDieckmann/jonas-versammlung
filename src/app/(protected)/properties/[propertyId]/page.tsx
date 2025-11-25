import PropertyDetailPage from "@/modules/properties/features/detail/property-detail.page";

interface PageProps {
    params: Promise<{ propertyId: string }>;
}

export default async function Page({ params }: PageProps) {
    const { propertyId } = await params;
    return <PropertyDetailPage propertyId={parseInt(propertyId, 10)} />;
}
