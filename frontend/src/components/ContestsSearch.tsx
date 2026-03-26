"use client";
import { useCallback, useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ContestsSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputVal, setInputVal] = useState(searchParams.get("contest") || "");

  const createQueryString = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const platform = params.get("platform");

      const newParams = new URLSearchParams();

      if (platform) {
        newParams.set("platform", platform);
      }

      if (value) {
        newParams.set("contest", value);
      }

      return newParams.toString();
    },
    [searchParams]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputVal(value);
    const queryString = createQueryString(value);
    const url = queryString ? `/?${queryString}` : "/";
    router.replace(url);
  };

  useEffect(() => {
    const contest = searchParams.get("contest");
    if (contest) {
      setInputVal(contest);
    }
  }, [searchParams]);

  return (
    <div className="flex-1 max-w-2xl w-full">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition-all duration-500" />
        <div className="relative flex items-center bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-1.5 shadow-2xl">
          <Search className="ml-4 text-zinc-500" size={20} />
          <Input
            type="text"
            placeholder="Search contests by name..."
            className="h-12 bg-transparent dark:bg-transparent bg-none border-none text-white placeholder:text-zinc-600 focus-visible:ring-0 shadow-none px-4"
            value={inputVal}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}
