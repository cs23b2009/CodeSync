import Image from "next/image";
import Link from "next/link";

export default function ProfileLink() {
    return (
        <Link
            href="https://portfolio-3bp0.onrender.com/"
            target="_blank"
            className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-300"
            title="View Portfolio"
        >
            <Image
                src="/indra.jpg"
                alt="Indra Kumar"
                fill
                className="object-cover"
            />
        </Link>
    );
}
