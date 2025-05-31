
import React from 'react';
import { FileText } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full max-w-6xl mx-auto py-8 mb-8 text-center">
      <div className="flex items-center justify-center mb-4">
        <FileText size={48} className="text-sky-400 mr-4" />
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300">
          DOCX Placeholder Replacer
        </h1>
      </div>
      <p className="text-slate-300 text-lg">
        Easily find and replace text in your Word documents while keeping formatting intact.
      </p>
    </header>
  );
};
