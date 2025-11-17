import DashboardLayout from "@/modules/dashboard/shared/dashboard.layout";

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
