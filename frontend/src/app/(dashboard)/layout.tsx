import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 min-h-screen">
                {children}
            </main>
        </div>
    );
}
