"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-16 md:py-32">
      <h1 className="text-4xl font-bold tracking-tight text-center sm:text-6xl">
        Rhino IA
      </h1>
      <p className="mt-6 text-lg text-center text-gray-600 max-w-3xl">
        Your powerful AI assistant for document management and intelligent conversations.
        Upload documents, chat with AI, and get insights instantly.
      </p>
      <div className="mt-10 flex items-center justify-center gap-6">
        <Link href="/chat">
          <Button size="lg" className="h-12 px-8">
            Start Chatting
          </Button>
        </Link>
      </div>
    </div>
  );
}
