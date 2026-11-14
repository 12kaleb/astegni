'use client';

import { useEffect, useState } from 'react';

const messages = {
  en: {
    home: 'Home', tutors: 'Find Tutors', about: 'About Us', pricing: 'Pricing',
    dashboard: 'Dashboard', account: 'Account & privacy', signIn: 'Sign In',
    signOut: 'Sign Out', getStarted: 'Get Started', language: 'Language',
    loading: 'Loading…', tryAgain: 'Try again', noResults: 'No results found.',
    heroTitle: 'The right tutor can change everything.',
    heroDescription: 'Find verified tutors in Addis Ababa and compare profiles, subjects, experience, languages, and rates.',
    searchSubject: 'Search by subject (Mathematics, Physics, Amharic)…',
    browseTutors: 'Browse Tutors',
  },
  am: {
    home: 'መነሻ', tutors: 'አስተማሪዎችን ፈልግ', about: 'ስለ እኛ', pricing: 'ዋጋ',
    dashboard: 'ዳሽቦርድ', account: 'መለያ እና ግላዊነት', signIn: 'ግባ',
    signOut: 'ውጣ', getStarted: 'ይጀምሩ', language: 'ቋንቋ',
    loading: 'በመጫን ላይ…', tryAgain: 'እንደገና ይሞክሩ', noResults: 'ምንም ውጤት አልተገኘም።',
    heroTitle: 'ትክክለኛው አስተማሪ ሁሉንም ነገር ሊቀይር ይችላል።',
    heroDescription: 'በአዲስ አበባ የተረጋገጡ አስተማሪዎችን ያግኙ፤ መገለጫዎቻቸውን፣ ትምህርቶቻቸውን እና ዋጋቸውን ያወዳድሩ።',
    searchSubject: 'በትምህርት ይፈልጉ (ሂሳብ፣ ፊዚክስ፣ አማርኛ)…',
    browseTutors: 'አስተማሪዎችን ይፈልጉ',
  },
};

export function useLanguage() {
  const [language, setLanguage] = useState('en');
  useEffect(() => {
    const saved = window.localStorage.getItem('astegni-language');
    if (saved === 'am' || saved === 'en') setLanguage(saved);
    const onLanguageChange = (event) => setLanguage(event.detail);
    window.addEventListener('astegni-language-change', onLanguageChange);
    return () => window.removeEventListener('astegni-language-change', onLanguageChange);
  }, []);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  function changeLanguage(value) {
    const next = value === 'am' ? 'am' : 'en';
    setLanguage(next);
    window.localStorage.setItem('astegni-language', next);
    document.documentElement.lang = next;
    window.dispatchEvent(new CustomEvent('astegni-language-change', { detail: next }));
  }
  return { language, setLanguage: changeLanguage, t: (key) => messages[language][key] || messages.en[key] || key };
}
