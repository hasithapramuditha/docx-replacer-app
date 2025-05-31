
import React from 'react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button
      {...props}
      className={`flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white
                  transition-all duration-150 ease-in-out transform active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed 
                  ${className}`}
    >
      {children}
    </button>
  );
};
