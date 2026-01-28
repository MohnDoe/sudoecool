"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-4">
      <Button
        size="2lg"
        nativeButton={false}
        className="elevated flex flex-col gap-1"
        render={
          <Link href="/daily" >
            <span className="font-bold text-3xl">
              Play
            </span>
          </Link>
        }>

      </Button>
      <span className="opacity-75 text-lg">Feb 1, 2026</span>
    </main>
  );
}
