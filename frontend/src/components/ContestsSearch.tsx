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
    <div className="flex-1 max-w-xl w-full">
      <div className="relative group">
        <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl shadow-soft overflow-hidden">
          <Search className="ml-4 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Search contests by name..."
            className="h-11 bg-transparent border-none text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 shadow-none px-3"
            value={inputVal}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}