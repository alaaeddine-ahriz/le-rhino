"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Lightbulb, MessageCircle, FileText, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: <FileText className="h-10 w-10 text-blue-500" />,
    title: "Analyse Intelligente de Documents",
    description: "Téléchargez vos documents et laissez Rhino IA extraire les informations clés et les résumés sans effort.",
  },
  {
    icon: <MessageCircle className="h-10 w-10 text-green-500" />,
    title: "Chat Propulsé par l'IA",
    description: "Engagez des conversations naturelles pour obtenir des réponses et des insights directement depuis vos documents téléchargés.",
  },
  {
    icon: <Lightbulb className="h-10 w-10 text-yellow-500" />,
    title: "Insights Instantanés",
    description: "Comprenez rapidement les documents et données complexes sans revue manuelle fastidieuse, vous faisant gagner du temps.",
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-purple-500" />,
    title: "Sécurisé & Privé",
    description: "Vos documents et conversations sont traités avec la plus grande sécurité et confidentialité.",
  },
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      {/* Section Héro */}
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Rhino IA
        </h1>
        <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
          Votre puissant assistant IA pour la gestion de documents et les conversations intelligentes.
          Téléchargez des documents, discutez avec l'IA et obtenez des insights instantanément.
        </p>
        <div className="mt-10 flex items-center justify-center gap-6">
          <Link href="/chat">
            <Button size="lg" className="h-12 px-8 text-lg">
              Commencer à Discuter
            </Button>
          </Link>
        </div>
      </div>

      {/* Section Fonctionnalités */}
      <div className="mt-12 md:mt-18">
        <h2 className="text-3xl font-bold tracking-tight text-center sm:text-4xl">
          Fonctionnalités Clés
        </h2>
        <p className="mt-4 text-lg text-center text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Découvrez comment Rhino IA peut révolutionner votre flux de travail et débloquer des insights précieux de vos documents.
        </p>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
