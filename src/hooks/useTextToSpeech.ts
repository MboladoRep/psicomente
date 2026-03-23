'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface UseTextToSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

interface UseTextToSpeechReturn {
  isPlaying: boolean;
  isPaused: boolean;
  isSupported: boolean;
  progress: number;
  currentSentence: number;
  totalSentences: number;
  play: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  speakSentence: (text: string, index: number) => void;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}): UseTextToSpeechReturn {
  const { rate = 1, pitch = 1, volume = 1, lang = 'es-ES' } = options;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSentence, setCurrentSentence] = useState(0);
  const [totalSentences, setTotalSentences] = useState(0);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sentencesRef = useRef<string[]>([]);
  const currentIndexRef = useRef(0);
  
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  // Split text into sentences
  const splitIntoSentences = (text: string): string[] => {
    // Split by common sentence endings, but keep the delimiter
    const sentences = text
      .replace(/([.!?])\s+/g, '$1|SPLIT|')
      .split('|SPLIT|')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    return sentences;
  };

  // Speak a specific sentence
  const speakSentence = useCallback((text: string, index: number) => {
    if (!isSupported) return;
    
    window.speechSynthesis.cancel();
    
    const sentences = splitIntoSentences(text);
    if (index < 0 || index >= sentences.length) return;
    
    sentencesRef.current = sentences;
    currentIndexRef.current = index;
    setTotalSentences(sentences.length);
    setCurrentSentence(index);
    
    const utterance = new SpeechSynthesisUtterance(sentences[index]);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.lang = lang;
    
    // Try to find a Spanish voice
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(voice => voice.lang.startsWith('es'));
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }
    
    utterance.onend = () => {
      if (currentIndexRef.current < sentencesRef.current.length - 1) {
        // Continue with next sentence
        currentIndexRef.current++;
        setCurrentSentence(currentIndexRef.current);
        setProgress((currentIndexRef.current / sentencesRef.current.length) * 100);
        speakSentence(text, currentIndexRef.current);
      } else {
        // Finished all sentences
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(100);
        setCurrentSentence(0);
      }
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
      setIsPaused(false);
    };
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, rate, pitch, volume, lang]);

  // Play from beginning or current position
  const play = useCallback((text: string) => {
    if (!isSupported) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const sentences = splitIntoSentences(text);
    sentencesRef.current = sentences;
    setTotalSentences(sentences.length);
    
    setIsPlaying(true);
    setIsPaused(false);
    setProgress(0);
    
    speakSentence(text, 0);
  }, [isSupported, speakSentence]);

  // Pause
  const pause = useCallback(() => {
    if (!isSupported || !isPlaying) return;
    
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported, isPlaying]);

  // Resume
  const resume = useCallback(() => {
    if (!isSupported || !isPaused) return;
    
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported, isPaused]);

  // Stop
  const stop = useCallback(() => {
    if (!isSupported) return;
    
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setCurrentSentence(0);
    currentIndexRef.current = 0;
  }, [isSupported]);

  return {
    isPlaying,
    isPaused,
    isSupported,
    progress,
    currentSentence,
    totalSentences,
    play,
    pause,
    resume,
    stop,
    speakSentence,
  };
}
