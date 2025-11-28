import PropertyDetailPage from "@/modules/properties/features/detail/property-detail.page";

interface PageProps {
    params: Promise<{ propertyId: string }>;
    searchParams: Promise<{ from?: string; meetingId?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
    const { propertyId } = await params;
    const search = await searchParams;
    return <PropertyDetailPage propertyId={parseInt(propertyId, 10)} searchParams={search} />;
}
