import { useState } from 'react';

interface PricingHeroProps {
  isAnnual: boolean;
  onToggle: (isAnnual: boolean) => void;
}

export default function PricingHero({ isAnnual, onToggle }: PricingHeroProps) {
  return (
    <section className="relative pt-32 pb-16 h-[400px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#f8f6f1] to-white"></div>
      <div className="absolute inset-0 opacity-50" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23d1d5db%22 fill-opacity=%220.1%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <h1 className="text-5xl font-serif font-bold text-brand-navy leading-tight">Choose Your Plan</h1>
        <p className="mt-4 text-lg text-brand-slate">Flexible pricing options designed for law firms of every size</p>

        <div className="mt-8 flex items-center justify-center space-x-4">
          <span className="text-brand-charcoal font-medium">Monthly</span>
          <div className="relative">
            <input
              type="checkbox"
              id="billing-switch"
              className="sr-only"
              checked={isAnnual}
              onChange={(e) => onToggle(e.target.checked)}
            />
            <label htmlFor="billing-switch" className="flex items-center cursor-pointer">
              <div className="relative">
                <div className={`w-14 h-8 rounded-full shadow-inner transition-colors duration-300 ${isAnnual ? 'bg-brand-gold' : 'bg-brand-gray-medium'}`}></div>
                <div className={`absolute w-6 h-6 bg-white rounded-full shadow-md top-1 left-1 transition-transform duration-300 ${isAnnual ? 'translate-x-6' : ''}`}></div>
              </div>
            </label>
          </div>
          <span className="text-brand-charcoal font-medium">Annual <span className="text-brand-gold text-sm">(Save up to 20%)</span></span>
        </div>
      </div>
    </section>
  );
}
