import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default function Footer() {
    return (
        <footer className="w-full py-8 mt-12 mb-4 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-700">
            <div className="h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent mb-4" />

            <div className="flex items-center gap-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 px-4 py-2 rounded-full shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 group">
                <Link
                    href="https://portfolio-3bp0.onrender.com/"
                    target="_blank"
                    className="flex items-center gap-3"
                >
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-100 dark:border-gray-700">
                        <Image
                            src="/indra.jpg"
                            alt="Indra Kumar"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium">Built by</span>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-500 transition-colors flex items-center gap-1">
                            Indra Kumar
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                    </div>
                </Link>
            </div>

            <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} CodeSync Pro
            </p>
        </footer>
    );
}
