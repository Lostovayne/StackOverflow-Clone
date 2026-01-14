"use client";

import Image from "next/image";

import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";

interface Props {
  route: string;
  imgSrc: string;
  placeholder: string;
  otherClasses?: string;
}

const LocalSearch = ({ route, imgSrc, placeholder, otherClasses }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const [search, setSearch] = useState(query || "");
  const previousSearchRef = useRef(search);

  useEffect(() => {
    // Only trigger if search actually changed
    if (previousSearchRef.current === search) return;
    previousSearchRef.current = search;

    const delayDebounceFn = setTimeout(() => {
      if (search) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: search,
        });

        router.push(newUrl, { scroll: false });
      } else {
        if (pathname === route) {
          const newUrl = removeKeysFromUrlQuery({
            params: searchParams.toString(),
            keysToRemove: ["query"],
          });

          router.push(newUrl, { scroll: false });
        }
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, route, pathname, router, searchParams]);

  return (
    <div
      className={cn(
        "background-light800_darkgradient flex min-h-14 grow items-center gap-4 rounded-[10px] px-4",
        otherClasses
      )}
    >
      <Image src={imgSrc} width={24} height={24} alt={"search icon"} className="cursor-pointer" />
      <Input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="paragraph-regular  no-focus placeholder:text-dark400_light700 border-none shadow-none outline-none dark:bg-transparent"
      />
    </div>
  );
};
export default LocalSearch;
