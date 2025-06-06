"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X, LogOut } from 'lucide-react';

export function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const routes = [
    { name: 'Chat', path: '/chat' },
    { name: 'Documents', path: '/documents' },
  ];

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link 
          href={user ? "/chat" : "/"} 
          className="flex items-center text-2xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity" 
          onClick={handleLinkClick}
        >
          <span className="mr-2 text-3xl">🦏</span>
          Le Rhino
        </Link>
        
        <div className="flex items-center gap-4">
          {user && (
            <nav className="hidden md:flex items-center space-x-1">
              {routes.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === route.path
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {route.name}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2">
            {user ? (
              <Link href="/profile" className="flex items-center gap-3">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-gray-200 dark:ring-gray-700 transition-all hover:ring-gray-300 dark:hover:ring-gray-600">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "Utilisateur"} />
                  <AvatarFallback>{user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/signin">
                  <Button variant="outline" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Connexion</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 hover:opacity-90 transition-opacity">Inscription</Button>
                </Link>
              </div>
            )}

            {user && (
              <div className="md:hidden">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Basculer le menu" className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && user && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg z-40 border-t border-gray-200/50 dark:border-gray-800/50 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1 p-4">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={`block px-4 py-2.5 rounded-lg text-base font-medium transition-all duration-200 ${
                  pathname === route.path
                    ? 'text-gray-900 dark:text-gray-50'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-50'
                }`}
                onClick={handleLinkClick}
              >
                {route.name}
              </Link>
            ))}
            <Link
              href="/profile"
              className="block px-4 py-2.5 rounded-lg text-base font-medium transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-50"
              onClick={handleLinkClick}
            >
              Profil
            </Link>
            <div className="border-t border-gray-200/50 dark:border-gray-800/50 pt-4 mt-3">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                    }}
                >
                    <LogOut className="mr-2 h-5 w-5" />
                    Déconnexion
                </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}