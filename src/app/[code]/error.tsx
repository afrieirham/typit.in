"use client";

import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
};

export default function Error({ error }: Props) {
  return (
    <main className="flex h-[100dvh] flex-col items-center justify-center">
      <h2 className="text-center text-2xl">404</h2>
      <p className="mt-4 flex gap-1">
        <span>{error.message}.</span>
        <span>Go</span>
        <Link href="/">
          <span className="underline">back home</span>.
        </Link>
      </p>
      <div className="fixed bottom-0">
        <div className="flex items-center justify-center gap-2 p-4">
          <Link href="/" className="font-bold hover:underline">
            typit.in
          </Link>
        </div>
      </div>
    </main>
  );
}
