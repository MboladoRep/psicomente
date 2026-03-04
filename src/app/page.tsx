'use client';

import { useEffect } from 'react';
import Header from '@/components/psychology/Header';
import Hero from '@/components/psychology/Hero';
import ChatSection from '@/components/psychology/ChatSection';
import ArticlesSection from '@/components/psychology/ArticlesSection';
import GamificationPanel from '@/components/psychology/GamificationPanel';
import EmotionalDiary from '@/components/psychology/EmotionalDiary';
import PsychologicalTests from '@/components/psychology/PsychologicalTests';
import MindfulnessZone from '@/components/psychology/MindfulnessZone';
import PricingSection from '@/components/psychology/PricingSection';
import Footer from '@/components/psychology/Footer';
import { useUser } from '@/hooks/useUser';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  const { addPoints, progress } = useUser();

  // Give welcome points on first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('psicomente_visited');
    if (!hasVisited) {
      localStorage.setItem('psicomente_visited', 'true');
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Chat Section */}
        <ChatSection />

        {/* Gamification / Progress */}
        <GamificationPanel />

        {/* Articles Section */}
        <ArticlesSection />

        {/* Tests Section */}
        <PsychologicalTests />

        {/* Emotional Diary */}
        <EmotionalDiary />

        {/* Mindfulness Zone */}
        <MindfulnessZone />

        {/* Pricing */}
        <PricingSection />
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}
