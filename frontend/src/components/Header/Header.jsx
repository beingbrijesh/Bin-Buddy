// src/components/Header/Header.jsx
import React from 'react';
import { ArrowDown } from 'lucide-react';

const Header = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#279e0a] to-[#1c7307]"></div>

      {/* Content */}
      <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto mt-16">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-playfair font-bold mb-6">
          Smart Waste Management <br />
          <span className="text-[#9cd88b]">for a Cleaner India</span>
        </h1>

        <p className="text-lg md:text-xl mb-12 opacity-90">
          BinBuddy revolutionizes waste collection with real-time tracking, 
          route optimization, and smart bin monitoring across the nation.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="#features" 
            className="px-8 py-3 bg-[#279e0a] hover:bg-[#1c7307] text-white rounded-full font-semibold transition-colors"
          >
            Discover Features
          </a>
          <a 
            href="#about" 
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold transition-colors"
          >
            Learn More
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white z-20">
        <a href="#about" className="flex flex-col items-center gap-2 animate-bounce">
          <span className="text-sm font-medium">Scroll Down</span>
          <ArrowDown className="w-5 h-5" />
        </a>
      </div>
    </section>
  );
};

export default Header;
