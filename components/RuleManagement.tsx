
import React, { useState } from 'react';
import { PlaceholderRule } from '../types';
import { ActionButton } from './ActionButton';
import { PlusCircle, Trash2, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface RuleManagementProps {
  rules: PlaceholderRule[];
  setRules: React.Dispatch<React.SetStateAction<PlaceholderRule[]>>;
  disabled?: boolean;
}

const generateId = (): string => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const RuleManagement: React.FC<RuleManagementProps> = ({ rules, setRules, disabled }) => {
  const [newRuleStart, setNewRuleStart] = useState<string>('{');
  const [newRuleEnd, setNewRuleEnd] = useState<string>('}');

  const addRule = () => {
    if (!newRuleStart.trim() || !newRuleEnd.trim()) {
      // Basic validation, can be enhanced with an error message
      alert("Rule start and end delimiters cannot be empty.");
      return;
    }
    setRules([...rules, { id: generateId(), start: newRuleStart, end: newRuleEnd }]);
    setNewRuleStart('{'); // Reset for next common pattern or leave as is
    setNewRuleEnd('}');
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  const updateRule = (id: string, field: 'start' | 'end', value: string) => {
    setRules(rules.map(rule => rule.id === id ? { ...rule, [field]: value } : rule));
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl h-full flex flex-col">
      <h2 className="text-2xl font-semibold mb-4 text-sky-300">2. Define Placeholder Rules</h2>
      
      <div className="flex gap-3 mb-4 items-end">
        <div className="flex-1">
          <label htmlFor="ruleStart" className="block text-sm font-medium text-slate-400 mb-1">Start Delimiter</label>
          <input
            id="ruleStart"
            type="text"
            value={newRuleStart}
            onChange={(e) => setNewRuleStart(e.target.value)}
            placeholder="e.g. [ or {{"
            className="w-full p-2.5 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500 transition-shadow shadow-sm"
            disabled={disabled}
          />
        </div>
        <div className="flex-1">
          <label htmlFor="ruleEnd" className="block text-sm font-medium text-slate-400 mb-1">End Delimiter</label>
          <input
            id="ruleEnd"
            type="text"
            value={newRuleEnd}
            onChange={(e) => setNewRuleEnd(e.target.value)}
            placeholder="e.g. ] or }}"
            className="w-full p-2.5 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500 transition-shadow shadow-sm"
            disabled={disabled}
          />
        </div>
        <ActionButton onClick={addRule} disabled={disabled || !newRuleStart.trim() || !newRuleEnd.trim()} className="h-[46px] px-4 self-end bg-indigo-600 hover:bg-indigo-500">
          <PlusCircle size={20} className="mr-1.5" /> Add
        </ActionButton>
      </div>

      {rules.length > 0 && (
        <div className="mt-2 space-y-3 flex-grow overflow-y-auto max-h-60 pr-2">
           <h3 className="text-lg font-medium text-slate-300 mb-2">Active Rules:</h3>
          {rules.map(rule => (
            <div key={rule.id} className="flex items-center gap-2 bg-slate-700 p-3 rounded-md shadow">
              <ChevronsLeft size={20} className="text-indigo-400 flex-shrink-0"/>
              <input
                type="text"
                value={rule.start}
                onChange={(e) => updateRule(rule.id, 'start', e.target.value)}
                className="flex-1 p-1.5 bg-slate-600 border border-slate-500 rounded-md text-slate-100 text-sm focus:ring-indigo-500 focus:border-indigo-500 min-w-[60px]"
                disabled={disabled}
                aria-label={`Start delimiter for rule ${rule.id}`}
              />
              <span className="text-slate-400 text-xs px-1 font-mono">...content...</span>
              <input
                type="text"
                value={rule.end}
                onChange={(e) => updateRule(rule.id, 'end', e.target.value)}
                className="flex-1 p-1.5 bg-slate-600 border border-slate-500 rounded-md text-slate-100 text-sm focus:ring-indigo-500 focus:border-indigo-500 min-w-[60px]"
                disabled={disabled}
                aria-label={`End delimiter for rule ${rule.id}`}
              />
              <ChevronsRight size={20} className="text-indigo-400 flex-shrink-0"/>
              <button
                onClick={() => !disabled && removeRule(rule.id)}
                className={`text-slate-500 hover:text-red-400 transition-colors ml-auto ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Remove rule"
                disabled={disabled}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
       {rules.length === 0 && (
        <div className="text-center py-6 text-slate-500">
            <p>No placeholder rules defined.</p>
            <p className="text-sm">Add a rule to start extracting placeholders.</p>
        </div>
       )}
    </div>
  );
};
