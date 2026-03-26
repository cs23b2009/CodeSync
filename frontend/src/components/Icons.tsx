import React from "react";
import Image from "next/image";

export const CodeforcesLogo = ({ className, size = 24 }: { className?: string; size?: number }) => (
    <div className={className} style={{ width: size, height: size, position: 'relative' }}>
        <Image
            src="/logos/codeforces.png"
            alt="Codeforces"
            width={size}
            height={size}
            className="object-contain"
        />
    </div>
);

export const LeetCodeLogo = ({ className, size = 24 }: { className?: string; size?: number }) => (
    <div className={className} style={{ width: size, height: size, position: 'relative' }}>
        <Image
            src="/logos/leetcode.png"
            alt="LeetCode"
            width={size}
            height={size}
            className="object-contain"
        />
    </div>
);

export const CodeChefLogo = ({ className, size = 24 }: { className?: string; size?: number }) => (
    <div className={className} style={{ width: size, height: size, position: 'relative' }}>
        <Image
            src="/logos/codechef.png"
            alt="CodeChef"
            width={size}
            height={size}
            className="object-contain"
        />
    </div>
);

export const PlatformLogo = ({ platform, className, size = 24 }: { platform: string; className?: string; size?: number }) => {
    const p = platform.toLowerCase();
    if (p.includes("codeforces")) return <CodeforcesLogo className={className} size={size} />;
    if (p.includes("leetcode")) return <LeetCodeLogo className={className} size={size} />;
    if (p.includes("codechef")) return <CodeChefLogo className={className} size={size} />;
    return null;
};
