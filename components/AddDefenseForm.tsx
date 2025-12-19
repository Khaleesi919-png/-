
import React, { useState } from 'react';
import { RowOption, DefensePoint, DefenseStatus } from '../types';

interface AddDefenseFormProps {
  onAdd: (point: DefensePoint) => void;
  savedLocations: string[];
}

export const AddDefenseForm: React.FC<AddDefenseFormProps> = ({ onAdd, savedLocations }) => {
  const [location, setLocation] = useState('');
  const [row, setRow] = useState<RowOption>(RowOption.ROW_1);
  const [guardian, setGuardian] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      alert("請輸入位置名稱");
      return;
    }
    
    const point: DefensePoint = {
      id: Math.random().toString(36).substr(2, 9),
      location: location.trim(),
      row,
      guardian: guardian.trim(),
      status: DefenseStatus.READY,
      startTime: null,
      prepEndTime: null,
      activeEndTime: null,
      cdEndTime: null,
      lastUpdate: Date.now()
    };

    onAdd(point);
    setLocation('');
    setGuardian('');
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl">
      <h2 className="text-base font-bold mb-4 text-blue-400 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        建立防禦據點
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">位置名稱</label>
          <input 
            type="text" 
            list="saved-locations"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="輸入位置"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <datalist id="saved-locations">
            {savedLocations.map(loc => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">防禦排級</label>
          <select 
            value={row}
            onChange={(e) => setRow(e.target.value as RowOption)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          >
            {Object.values(RowOption).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">駐守門神</label>
          <input 
            type="text" 
            value={guardian}
            onChange={(e) => setGuardian(e.target.value)}
            placeholder="姓名"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 mt-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          加入清單
        </button>
      </form>
    </div>
  );
};
