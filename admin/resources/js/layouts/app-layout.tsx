import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";

interface Props {
    children: React.ReactNode;
    className?: string;
}

export function AppLayout({ children, className = "" }: Props) {
    return (
        <div
            className={cn(
                "min-h-screen bg-[#fafafa] font-sans flex flex-col",
                className,
            )}
        >
            <Navbar />
            <main className="flex-1 pt-[60px]">
                <div className="max-w-7xl mx-auto py-8 sm:py-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
