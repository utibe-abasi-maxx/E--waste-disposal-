import React from 'react';
import { Recycle } from 'lucide-react';
import { UserRole } from '../types';

interface FooterProps {
  setActiveTab?: (tab: string) => void;
  onResetData?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
}) => {
  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t-2 border-emerald-500 py-8 px-4 text-center transition-colors">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center space-y-3">
        {/* LOGO: E-WASTE with green color and recycle icon ♻️ */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <span>E-WASTE</span>
            <span className="text-2xl" role="img" aria-label="recycle">♻️</span>
          </span>
        </div>

        {/* CREDIT TEXT: Proudly Made By Government Secondary School Afaha Eket */}
        <p className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">
          Proudly Made By Government Secondary School Afaha Eket
        </p>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Akwa Ibom State E-Waste Disposal & Safe Recycling Network
        </p>

        {setActiveTab && (
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="hover:underline cursor-pointer"
            >
              Dashboard
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActiveTab('education')}
              className="hover:underline cursor-pointer"
            >
              Waste Education
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActiveTab('suggestions')}
              className="hover:underline cursor-pointer"
            >
              Help & Suggestions
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className="hover:underline cursor-pointer"
            >
              Explore Map
            </button>
          </div>
        )}
      </div>
    </footer>
  );
};
