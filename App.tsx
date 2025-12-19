
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DefensePoint, DefenseStatus, RowOption } from './types';
import { AddDefenseForm } from './components/AddDefenseForm';
import { DefenseCard } from './components/DefenseCard';
import { getLocationColor } from './utils/timeUtils';

const PASSCODE = "0000"; 

const App: React.FC = () => {
  const [points, setPoints] = useState<DefensePoint[]>([]);
  const [savedLocations, setSavedLocations] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPasscode, setInputPasscode] = useState("");
  const [loginError, setLoginError] = useState(false);

  // 頂部即時時鐘
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 從 LocalStorage 載入資料（完全本地化）
  useEffect(() => {
    const savedPoints = localStorage.getItem('defense_points');
    const savedLocs = localStorage.getItem('defense_locations');
    
    if (savedPoints) {
      try {
        setPoints(JSON.parse(savedPoints));
      } catch (e) {
        console.error("Failed to parse saved points", e);
      }
    }
    
    if (savedLocs) {
      try {
        setSavedLocations(JSON.parse(savedLocs));
      } catch (e) {
        console.error("Failed to parse saved locations", e);
      }
    }
  }, []);

  // 存入 LocalStorage
  useEffect(() => {
    localStorage.setItem('defense_points', JSON.stringify(points));
    
    const uniqueLocations = Array.from(new Set([...savedLocations, ...points.map(p => p.location)]));
    if (uniqueLocations.length !== savedLocations.length) {
      setSavedLocations(uniqueLocations);
      localStorage.setItem('defense_locations', JSON.stringify(uniqueLocations));
    }
  }, [points, savedLocations]);

  const addPoint = useCallback((point: DefensePoint) => {
    setPoints(prev => [point, ...prev]);
  }, []);

  const updatePoint = useCallback((id: string, updates: Partial<DefensePoint>) => {
    setPoints(prev => prev.map(p => p.id === id ? { ...p, ...updates, lastUpdate: Date.now() } : p));
  }, []);

  const cancelLockdown = useCallback((id: string) => {
    setPoints(prev => prev.map(p => {
      if (p.id === id) {
        return { 
          ...p, 
          status: DefenseStatus.READY,
          startTime: null,
          prepEndTime: null,
          activeEndTime: null,
          cdEndTime: null,
          lastUpdate: Date.now() 
        };
      }
      return p;
    }));
  }, []);

  const removePoint = useCallback((id: string) => {
    setPoints(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleKeypadPress = (num: string) => {
    if (inputPasscode.length < 4) {
      const newPass = inputPasscode + num;
      setInputPasscode(newPass);
      setLoginError(false);
      if (newPass.length === 4) {
        if (newPass === PASSCODE) {
          setTimeout(() => setIsAuthenticated(true), 300);
        } else {
          setTimeout(() => {
            setLoginError(true);
            setInputPasscode("");
          }, 500);
        }
      }
    }
  };

  const clearPasscode = () => {
    setInputPasscode("");
    setLoginError(false);
  };

  const nestedGroupedPoints = useMemo(() => {
    const grouped = points.reduce((acc, point) => {
      if (!acc[point.location]) acc[point.location] = {
        [RowOption.ROW_1]: [],
        [RowOption.ROW_2]: [],
        [RowOption.ROW_3]: []
      };
      acc[point.location][point.row].push(point);
      return acc;
    }, {} as Record<string, Record<RowOption, DefensePoint[]>>);
    return grouped;
  }, [points]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-['Noto+Sans+TC']">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-blue-900/20 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40 mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white mb-2">身分識別驗證</h1>
          <p className="text-[10px] text-slate-500 tracking-[0.2em] font-bold uppercase mb-8">Identification Required / Restricted Access</p>
          
          <div className="flex justify-center gap-4 mb-10">
            {[0, 1, 2, 3].map((idx) => (
              <div 
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                  inputPasscode.length > idx 
                    ? (loginError ? 'bg-red-500 border-red-500 animate-pulse' : 'bg-blue-500 border-blue-500 scale-125') 
                    : 'border-slate-700 bg-transparent'
                }`}
              ></div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleKeypadPress(num.toString())}
                className="h-16 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl text-xl font-bold text-white transition-all active:scale-95 mono"
              >
                {num}
              </button>
            ))}
            <button
              onClick={clearPasscode}
              className="h-16 bg-slate-900 hover:bg-red-900/20 border border-slate-800 rounded-2xl text-xs font-bold text-slate-500 hover:text-red-400 transition-all active:scale-95"
            >
              CLEAR
            </button>
            <button
              onClick={() => handleKeypadPress("0")}
              className="h-16 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl text-xl font-bold text-white transition-all active:scale-95 mono"
            >
              0
            </button>
            <div className="h-16 flex items-center justify-center">
              {loginError && <span className="text-red-500 text-[10px] font-black uppercase animate-bounce">Denied</span>}
            </div>
          </div>
          
          <p className="mt-8 text-[9px] text-slate-600 font-bold uppercase tracking-widest">系統安全層級: Delta-7</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 pb-20">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:raw-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/40">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase italic">國防指揮系統</h1>
              <p className="text-[10px] text-slate-500 tracking-[0.2em] font-bold uppercase">Defense Command Center</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="text-right border-r border-slate-800 pr-8">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">當前系統時間 (24H)</p>
              <p className="text-2xl font-black text-white mono">
                {currentTime.toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
            <div className="flex items-center gap-6 text-right">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">據點總數</p>
                <p className="text-lg font-bold text-white mono">{points.length}</p>
              </div>
              <div className="border-l border-slate-800 pl-6">
                <p className="text-[10px] text-slate-500 font-bold uppercase">系統狀態</p>
                <div className="flex items-center gap-2 justify-end">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3">
          <div className="sticky top-24 space-y-4">
            <AddDefenseForm onAdd={addPoint} savedLocations={savedLocations} />
            
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">操作說明</h3>
              <div className="space-y-2">
                <div className="bg-slate-800/30 p-2 rounded border-l-2 border-blue-600">
                  <p className="text-[10px] text-slate-400 leading-tight">
                    1. 建立據點後，點擊據點卡片內的按鈕啟動防禦程序。
                  </p>
                </div>
                <div className="bg-slate-800/30 p-2 rounded border-l-2 border-amber-600">
                  <p className="text-[10px] text-slate-400 leading-tight">
                    2. 預約時間即為開始閉城時間，準備階段會自動往前推算。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-9">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-lg font-black text-white uppercase tracking-wider border-b-2 border-blue-600 pb-1 italic">監控中之防線清單</h2>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Local Data Storage Enabled</div>
          </div>

          {points.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-900 rounded-3xl bg-slate-900/5">
              <svg className="w-16 h-16 text-slate-900 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A2 2 0 013 15.488V5.512a2 2 0 011.553-1.944L9 2l5.447 2.724A2 2 0 0116 6.668V16.512a2 2 0 01-1.553 1.944L9 20z" />
              </svg>
              <p className="text-slate-700 font-bold italic tracking-wide">當前無任何部署中之防禦點。</p>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(nestedGroupedPoints).map(([location, rows], idx) => (
                <section key={location} className="relative bg-slate-900/20 border border-slate-800/50 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-8">
                    <h3 className={`text-2xl font-black uppercase tracking-tighter flex items-center gap-3 ${getLocationColor(idx)}`}>
                      <span className="w-2 h-8 bg-current rounded-full opacity-50"></span>
                      {location}
                    </h3>
                    <div className="flex-1 border-b border-slate-800 border-dashed"></div>
                  </div>
                  
                  <div className="space-y-10">
                    {(Object.values(RowOption) as RowOption[]).map((rowKey) => {
                      const rowPoints = rows[rowKey];
                      if (rowPoints.length === 0) return null;
                      
                      return (
                        <div key={rowKey} className="space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30 uppercase tracking-[0.1em]">
                              {rowKey}
                            </span>
                            <div className="flex-1 h-px bg-slate-800/50"></div>
                            <span className="text-[9px] text-slate-600 font-bold uppercase">{rowPoints.length} 節點</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pl-4">
                            {rowPoints.map(point => (
                              <DefenseCard 
                                key={point.id} 
                                point={point} 
                                onUpdate={updatePoint} 
                                onRemove={removePoint}
                                onCancel={cancelLockdown}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="mt-32 border-t border-slate-900 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-slate-700 text-[10px] font-bold uppercase tracking-[0.2em]">
          <p>© 2024 Command Center Local Dashboard. No External API Required.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
