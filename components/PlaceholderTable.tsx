
import React from 'react';
import { ExtractedPlaceholder, ReplacementValues } from '../types';
import { Edit3 } from 'lucide-react';

interface PlaceholderTableProps {
  placeholders: ExtractedPlaceholder[];
  replacementValues: ReplacementValues;
  onReplacementChange: (values: ReplacementValues) => void;
  disabled?: boolean;
}

export const PlaceholderTable: React.FC<PlaceholderTableProps> = ({ placeholders, replacementValues, onReplacementChange, disabled }) => {
  const handleInputChange = (placeholderName: string, value: string) => {
    onReplacementChange({
      ...replacementValues,
      [placeholderName]: value,
    });
  };

  if (placeholders.length === 0) {
    return (
      <div className="bg-slate-800 p-6 rounded-xl shadow-2xl text-center">
        <p className="text-slate-400">No placeholders extracted yet, or none found with the current rules.</p>
        <p className="text-sm text-slate-500">Click "Extract Placeholders" after uploading files and defining rules.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-semibold mb-6 text-sky-300 flex items-center">
        <Edit3 size={28} className="mr-3 text-sky-400" /> 3. Provide Replacement Values
      </h2>
      <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4">
        {placeholders.map(placeholder => (
          <div key={placeholder.name} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <label
              htmlFor={`placeholder-${placeholder.name}`}
              className="text-sm font-mono text-slate-300 truncate py-2.5"
              title={placeholder.name}
            >
              {placeholder.name}
            </label>
            <input
              id={`placeholder-${placeholder.name}`}
              type="text"
              value={replacementValues[placeholder.name] || ''}
              onChange={(e) => handleInputChange(placeholder.name, e.target.value)}
              placeholder={`Enter value for ${placeholder.name}`}
              className="w-full p-2.5 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500 transition-shadow shadow-sm"
              disabled={disabled}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
