import EditPropertyPage from "@/modules/properties/features/edit/edit-property.page";

interface PageProps {
    params: Promise<{ propertyId: string }>;
}

export default async function PropertyEditRoute({ params }: PageProps) {
    const { propertyId } = await params;
    return <EditPropertyPage propertyId={parseInt(propertyId, 10)} />;
}
