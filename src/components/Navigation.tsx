"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const routes = [
    { name: 'Home', path: '/' },
    { name: 'Chat', path: '/chat' },
    { name: 'Documents', path: '/documents' },
  ];

  return (
    <header className="w-full bg-white shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center text-2xl font-extrabold text-gray-900">
            <span className="mr-2 text-3xl">🦏</span>
            Le Rhino
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === route.path
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {route.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "User"} />
                <AvatarFallback>{user.displayName?.[0] || user.email?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <Button variant="outline" onClick={logout}>Logout</Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 