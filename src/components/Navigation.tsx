"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from "next-themes";

export function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const routes = [
    { name: 'Accueil', path: '/' },
    { name: 'Chat', path: '/chat' },
    { name: 'Documents', path: '/documents' },
  ];

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center text-2xl font-extrabold text-gray-900 dark:text-gray-100" onClick={handleLinkClick}>
          <span className="mr-2 text-3xl">🦏</span>
          Le Rhino
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-4">
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === route.path
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {route.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "Utilisateur"} />
                  <AvatarFallback>{user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" onClick={handleLogout}>Déconnexion</Button>
              </div>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="outline" size="sm">Connexion</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Inscription</Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Basculer le menu">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="ml-2"
          >
            {mounted ? (
              theme === "dark" ? (
                <Sun className="h-5 w-5 transition-all" />
              ) : (
                <Moon className="h-5 w-5 transition-all" />
              )
            ) : (
              <div className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-lg z-40 border-t border-gray-200 dark:border-gray-700">
          <nav className="flex flex-col space-y-1 p-4">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === route.path
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-50'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-50'
                }`}
                onClick={handleLinkClick}
              >
                {route.name}
              </Link>
            ))}
            <div className="sm:hidden border-t border-gray-200 dark:border-gray-700 pt-4 mt-3 flex flex-col space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "Utilisateur"} />
                      <AvatarFallback>{user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm text-gray-700 dark:text-gray-300">{user.displayName || user.email}</span>
                  </div>
                  <Button variant="outline" className="w-full" onClick={handleLogout}>Déconnexion</Button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" onClick={handleLinkClick}>
                    <Button variant="outline" className="w-full">Connexion</Button>
                  </Link>
                  <Link href="/auth/signup" onClick={handleLinkClick}>
                    <Button className="w-full">Inscription</Button>
                  </Link>
                </>
              )}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-3">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-base font-medium"
                    onClick={() => {
                        setTheme(theme === "dark" ? "light" : "dark");
                        setIsMobileMenuOpen(false);
                    }}
                    aria-label="Toggle theme"
                >
                    {mounted ? (
                        theme === "dark" ? (
                            <Sun className="mr-2 h-5 w-5" />
                        ) : (
                            <Moon className="mr-2 h-5 w-5" />
                        )
                    ) : (
                        <div className="mr-2 h-5 w-5 inline-block" />
                    )}
                    Changer de thème
                </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}