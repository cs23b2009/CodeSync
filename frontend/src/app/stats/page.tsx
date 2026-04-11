import { Metadata } from "next";
import PortfolioTracker from "@/components/PortfolioTracker";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
    title: "Stats | CodeSync",
    description: "Track your competitive programming progress across all platforms.",
};

export default function StatsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground font-[family-name:var(--font-geist-sans)] selection:bg-blue-100 relative overflow-x-hidden pt-28">
            <div className="absolute inset-0 -z-10 h-full w-full bg-grid-cream"></div>

            <div className="w-full max-w-6xl mx-auto px-6 py-6 flex flex-col items-center">
                <div className="w-full mb-16">
                    <PortfolioTracker />
                </div>

                <Footer />
            </div>
        </div>
    );
}