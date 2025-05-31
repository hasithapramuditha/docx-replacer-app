
import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

export enum AlertType {
  Success = 'success',
  Error = 'error',
  Info = 'info',
}

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const baseClasses = "p-4 mb-4 rounded-lg shadow-lg flex items-center relative";
  let typeClasses = "";
  let IconComponent: React.ElementType = AlertCircle;

  switch (type) {
    case AlertType.Success:
      typeClasses = "bg-green-700 text-green-100 border border-green-600";
      IconComponent = CheckCircle;
      break;
    case AlertType.Error:
      typeClasses = "bg-red-700 text-red-100 border border-red-600";
      IconComponent = AlertCircle;
      break;
    case AlertType.Info:
      typeClasses = "bg-sky-700 text-sky-100 border border-sky-600";
      IconComponent = AlertCircle; // Or Info icon if preferred
      break;
  }

  return (
    <div className={`${baseClasses} ${typeClasses} w-full max-w-6xl mx-auto`}>
      <IconComponent size={20} className="mr-3 flex-shrink-0" />
      <span className="text-sm flex-grow">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-md hover:bg-opacity-20 hover:bg-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-colors"
          aria-label="Close alert"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};
