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
          backgroundImage: "url('/rhino-bg.jpeg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/30 via-gray-900/20 to-gray-900/30 dark:from-gray-900/50 dark:via-gray-900/40 dark:to-gray-900/50 backdrop-blur-[1px]" />
      </div>
      
      {/* Profile Content */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="flex flex-col items-center gap-8 max-w-4xl mx-auto">
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