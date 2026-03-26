import { Metadata } from "next";
import PortfolioTracker from "@/components/PortfolioTracker";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
    title: "Portfolio Tracker | CodeSync Pro",
    description: "Track your competitive programming progress across all platforms.",
};

export default function StatsPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-foreground font-[family-name:var(--font-geist-sans)] selection:bg-blue-500/30 relative overflow-x-hidden pt-32">
            <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:32px_32px]"></div>

            <div className="w-full max-w-7xl mx-auto px-6 py-6 flex flex-col items-center">
                <div className="w-full mb-20">
                    <PortfolioTracker />
                </div>

                <Footer />
            </div>
        </div>
    );
}
