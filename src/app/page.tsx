"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageCircle, FileText, ShieldCheck, ArrowRight, Brain } from 'lucide-react';

const features = [
  {
    icon: <FileText className="h-12 w-12 text-white" />,
    color: "from-blue-600 to-blue-400",
    title: "Analyse de Documents Pédagogiques",
    description: "Téléchargez vos cours, polycopiés et supports pédagogiques pour permettre à le Rhino d'y puiser les réponses à vos questions.",
  },
  {
    icon: <MessageCircle className="h-12 w-12 text-white" />,
    color: "from-emerald-600 to-emerald-400",
    title: "Assistant Pédagogique Intelligent",
    description: "Posez vos questions sur le contenu des cours et obtenez des explications claires basées sur vos supports pédagogiques.",
  },
  {
    icon: <Brain className="h-12 w-12 text-white" />,
    color: "from-amber-500 to-amber-300",
    title: "Compréhension Approfondie",
    description: "Approfondissez votre compréhension des concepts difficiles avec des explications adaptées à votre parcours d'apprentissage.",
  },
  {
    icon: <ShieldCheck className="h-12 w-12 text-white" />,
    color: "from-purple-600 to-purple-400",
    title: "Accompagnement Personnalisé",
    description: "Bénéficiez d'un suivi continu de votre apprentissage grâce à l'historique de vos conversations et documents.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>
        
        {/* Animated Shapes */}
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 blur-3xl opacity-20 animate-pulse delay-1000"></div>
        
        <div className="container relative mx-auto px-4 py-24 md:py-40">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col space-y-8">
              <div>
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
                  Le Rhino <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">IA</span>
        </h1>
                <p className="text-xl md:text-2xl text-gray-200 leading-relaxed">
                  Votre assistant pédagogique intelligent qui répond à vos questions en se basant sur le contenu de vos cours.
        </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/chat">
                  <Button size="lg" className="h-14 px-8 text-lg font-medium bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 border-0 shadow-lg hover:shadow-xl hover:scale-105 text-white dark:text-white">
                    Commencer
                    <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

            <div className="hidden md:block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-30 -z-10 transform rotate-6"></div>
              <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur border border-gray-700/50 p-8 rounded-3xl shadow-2xl">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    🦏
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded-full w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded-full w-1/2"></div>
                  </div>
                </div>
                <div className="bg-gray-800/80 rounded-xl p-4 mb-4">
                  <p className="text-gray-300 text-sm">Je ne comprends pas bien le concept d&apos;héritage multiple en programmation orientée objet. Peux-tu m&apos;expliquer ?</p>
                </div>
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-4 border border-purple-500/20">
                  <p className="text-gray-200 text-sm">D&apos;après votre cours de POO du semestre 3, l&apos;héritage multiple permet à une classe d&apos;hériter des attributs et méthodes de plusieurs classes parentes. Contrairement à l&apos;héritage simple, où une classe ne peut hériter que d&apos;une seule classe...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Accompagnement Personnalisé
        </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Découvrez comment le Rhino exploite vos documents pédagogiques pour vous aider à mieux comprendre vos cours et à réussir vos études.
        </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
              <div 
                key={feature.title} 
                className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:translate-y-[-5px] group"
              >
                <div className={`bg-gradient-to-r ${feature.color} p-6 group-hover:scale-105 transition-transform duration-300`}>
                  <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {feature.icon}
              </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                {feature.title}
              </h3>
                  <p className="text-gray-600 dark:text-gray-300 flex-1">
                {feature.description}
              </p>
                </div>
            </div>
          ))}
          </div>

          {/* Call to Action */}
          <div className="mt-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-10 md:p-16 relative">
              <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5"></div>
              <div className="relative z-10 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Besoin d&apos;aide avec vos cours ?
                </h2>
                <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
                  Commencez dès maintenant à poser vos questions et à explorer vos documents pédagogiques avec un assistant IA dédié à votre réussite académique.
                </p>
                <Link href="/chat">
                  <Button size="lg" className="h-14 px-10 text-lg font-medium bg-white text-indigo-600 hover:bg-indigo-50 transition-all duration-300 border-0 shadow-lg hover:shadow-xl">
                    Poser une question
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
