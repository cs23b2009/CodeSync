import { SearchFriends } from "@/features/search/SearchFriends";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Search Your Friends | CodeSync Pro',
    description: 'Search and discover competitive programming profiles on CodeSync Pro.',
};

export default function SearchPage() {
    return (
        <main className="min-h-screen pt-20 pb-12 bg-black">
            <SearchFriends />
        </main>
    );
}
