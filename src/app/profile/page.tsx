"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { Settings, User, LogOut } from "lucide-react";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin");
    }
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/signin");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Banner */}
      <div 
        className="h-32 bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\" fill=\"%239C92AC\" fill-opacity=\"0.05\" fill-rule=\"evenodd\"/%3E%3C/svg%3E')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/5 via-gray-900/10 to-gray-900/5 dark:from-gray-100/5 dark:via-gray-100/10 dark:to-gray-100/5 backdrop-blur-[2px]" />
      </div>
      
      {/* Profile Content */}
      <div className="container max-w-4xl -mt-16 relative z-10">
        <div className="flex flex-col items-center gap-8">
          {/* Header */}
          <div className="flex flex-col items-center gap-6 text-center">
            <Avatar className="h-24 w-24 ring-4 ring-white dark:ring-gray-900 shadow-lg">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "Utilisateur"} />
              <AvatarFallback className="text-3xl">
                {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{user.displayName || "Utilisateur"}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="account" className="w-full max-w-2xl">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mx-auto">
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Compte</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Paramètres</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations du compte</CardTitle>
                  <CardDescription>
                    Consultez et gérez vos informations personnelles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Email</h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    {user.displayName && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Nom d&apos;affichage</h4>
                        <p className="text-sm text-muted-foreground">{user.displayName}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres</CardTitle>
                  <CardDescription>
                    Gérez vos préférences et paramètres de compte
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="destructive" 
                    onClick={handleLogout}
                    className="w-full sm:w-auto flex items-center gap-2 mx-auto"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 