
import React, { useState, useEffect } from 'react';
import { DefensePoint, DefenseStatus, PREP_DURATION, ACTIVE_DURATION, CD_DURATION } from '../types';
import { formatTime, formatDuration, getStatusColors } from '../utils/timeUtils';

interface DefenseCardProps {
  point: DefensePoint;
  onUpdate: (id: string, updates: Partial<DefensePoint>) => void;
  onRemove: (id: string) => void;
  onCancel: (id: string) => void;
}

export const DefenseCard: React.FC<DefenseCardProps> = ({ point, onUpdate, onRemove, onCancel }) => {
  const [now, setNow] = useState(Date.now());
  const [isScheduledToday, setIsScheduledToday] = useState(true);
  const [scheduledTime, setScheduledTime] = useState('');

  // 當狀態重置為待命時，清空預約時間輸入
  useEffect(() => {
    if (point.status === DefenseStatus.READY) {
      setScheduledTime('');
    }
  }, [point.status]);

  // 狀態自動轉換邏輯
  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);

      if (point.startTime && point.status !== DefenseStatus.READY) {
        let newStatus = point.status;

        if (currentTime < point.prepEndTime!) {
          newStatus = DefenseStatus.PREPARING;
        } else if (currentTime < point.activeEndTime!) {
          newStatus = DefenseStatus.ACTIVE;
        } else if (currentTime < point.cdEndTime!) {
          newStatus = DefenseStatus.COOLDOWN;
        } else {
          newStatus = DefenseStatus.READY;
        }

        if (newStatus !== point.status) {
          onUpdate(point.id, { status: newStatus });
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [point, onUpdate]);

  const handleImmediateLockdown = () => {
    const startTime = Date.now();
    onUpdate(point.id, {
      status: DefenseStatus.PREPARING,
      startTime,
      prepEndTime: startTime + PREP_DURATION,
      activeEndTime: startTime + PREP_DURATION + ACTIVE_DURATION,
      cdEndTime: startTime + PREP_DURATION + ACTIVE_DURATION + CD_DURATION,
    });
  };

  const handleScheduledLockdown = () => {
    if (!scheduledTime) {
      alert("請選擇預約時間");
      return;
    }

    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const targetDate = new Date();
    targetDate.setHours(hours, minutes, 0, 0);

    if (!isScheduledToday) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    // 預約時間即為「開始閉城(Active)」的時間
    const activeStartTime = targetDate.getTime();
    
    // 準備時間往前推 2.5 小時
    const startTime = activeStartTime - PREP_DURATION;

    // 檢查結束冷卻時間是否已經過去（不能預約過去的排程）
    if (activeStartTime + ACTIVE_DURATION + CD_DURATION < Date.now()) {
      alert("預約的防禦時段已過時，請選擇未來的時間");
      return;
    }

    onUpdate(point.id, {
      status: DefenseStatus.PREPARING,
      startTime,
      prepEndTime: activeStartTime, // 預約時間 = 準備結束 = 閉城開始
      activeEndTime: activeStartTime + ACTIVE_DURATION,
      cdEndTime: activeStartTime + ACTIVE_DURATION + CD_DURATION,
    });
    setScheduledTime('');
  };

  const getRemainingTime = () => {
    if (!point.startTime || point.status === DefenseStatus.READY) return null;
    if (point.status === DefenseStatus.PREPARING) return point.prepEndTime! - now;
    if (point.status === DefenseStatus.ACTIVE) return point.activeEndTime! - now;
    if (point.status === DefenseStatus.COOLDOWN) return point.cdEndTime! - now;
    return null;
  };

  const remaining = getRemainingTime();

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 shadow-md backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all max-w-sm">
      <div className={`absolute top-0 right-0 px-1.5 py-0.5 text-[8px] font-bold border-b border-l rounded-bl-lg uppercase tracking-wider ${getStatusColors(point.status)}`}>
        {point.status}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1.5">
             <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">{point.row}</span>
             <span className="text-slate-800 text-[10px]">|</span>
             <span className="text-xs font-bold text-white truncate max-w-[100px]">{point.guardian || "未指派門神"}</span>
          </div>
        </div>

        {point.status === DefenseStatus.READY ? (
          <div className="space-y-2 pt-0.5">
            <div className="grid grid-cols-2 gap-1.5">
              <button 
                type="button"
                onClick={handleImmediateLockdown}
                className="bg-red-600/80 hover:bg-red-600 text-white text-[10px] font-bold py-1.5 rounded transition-all active:scale-95"
              >
                立即閉城
              </button>
              <button 
                type="button"
                onClick={() => setScheduledTime(scheduledTime ? '' : '12:00')}
                className="bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold py-1.5 rounded transition-all active:scale-95"
              >
                預約閉城
              </button>
            </div>
            
            {scheduledTime && (
              <div className="bg-slate-950/50 p-2 rounded border border-slate-800 animate-in fade-in slide-in-from-top-1">
                <div className="flex gap-1.5 mb-1.5">
                  <button 
                    type="button"
                    onClick={() => setIsScheduledToday(true)}
                    className={`flex-1 text-[9px] py-0.5 rounded font-bold border transition-all ${isScheduledToday ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 text-slate-500'}`}
                  >
                    今日
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsScheduledToday(false)}
                    className={`flex-1 text-[9px] py-0.5 rounded font-bold border transition-all ${!isScheduledToday ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 text-slate-500'}`}
                  >
                    明日
                  </button>
                </div>
                <div className="flex gap-1.5">
                  <input 
                    type="time" 
                    step="60"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-white text-[10px] focus:outline-none"
                  />
                  <button 
                    type="button"
                    onClick={handleScheduledLockdown}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-colors"
                  >
                    確認
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] bg-slate-950/50 p-1.5 rounded border border-slate-800/50">
              <div className="border-b border-slate-800 pb-0.5">
                <p className="text-slate-500 uppercase font-bold text-[7px] mb-0">1. 開始</p>
                <p className="text-slate-200 mono font-bold leading-tight">
                  {point.prepEndTime ? formatTime(point.prepEndTime) : '--:--'}
                </p>
              </div>
              <div className="border-b border-slate-800 pb-0.5">
                <p className="text-slate-500 uppercase font-bold text-[7px] mb-0">2. 結束</p>
                <p className="text-slate-200 mono font-bold leading-tight">
                  {point.activeEndTime ? formatTime(point.activeEndTime) : '--:--'}
                </p>
              </div>
              <div className="pt-0.5">
                <p className="text-slate-500 uppercase font-bold text-[7px] mb-0">3. 冷卻</p>
                <p className="text-amber-400 mono font-bold leading-tight">
                  {point.cdEndTime ? formatTime(point.cdEndTime) : '--:--'}
                </p>
              </div>
              <div className="pt-0.5">
                <p className="text-slate-500 uppercase font-bold text-[7px] mb-0">4. 下次</p>
                <p className="text-emerald-400 mono font-bold leading-tight">
                  {point.cdEndTime ? formatTime(point.cdEndTime + PREP_DURATION) : '--:--'}
                </p>
              </div>
            </div>

            {remaining !== null && remaining > 0 && (
              <div className="mt-0.5">
                <div className="flex justify-between items-end mb-0.5">
                   <p className="text-[8px] text-slate-500 font-bold uppercase">
                    {point.status === DefenseStatus.PREPARING ? '準備中' : 
                     point.status === DefenseStatus.ACTIVE ? '閉城中' : '冷卻倒數'}
                  </p>
                  <p className="text-sm font-black mono tracking-tighter text-white">
                    {formatDuration(remaining)}
                  </p>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      point.status === DefenseStatus.PREPARING ? 'bg-amber-500' : 
                      point.status === DefenseStatus.ACTIVE ? 'bg-red-600 animate-pulse' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.max(0, Math.min(100, (remaining / (point.status === DefenseStatus.PREPARING ? PREP_DURATION : point.status === DefenseStatus.ACTIVE ? ACTIVE_DURATION : CD_DURATION)) * 100))}%` }}
                  ></div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-between items-center mt-0.5 pt-1.5 border-t border-slate-800/50">
          <div className="flex gap-2">
            {point.status !== DefenseStatus.READY && (
              <button 
                type="button"
                onClick={() => onCancel(point.id)}
                className="text-[8px] bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-200 px-2 py-1 rounded font-bold uppercase transition-all border border-slate-700 active:scale-95"
              >
                取消
              </button>
            )}
          </div>
          <button 
            type="button"
            onClick={() => onRemove(point.id)}
            className="text-[8px] text-slate-600 hover:text-red-400 transition-colors uppercase font-bold bg-slate-900/40 px-1.5 py-1 rounded border border-transparent hover:border-red-900/50 active:scale-95"
          >
            移除
          </button>
        </div>
      </div>
    </div>
  );
};
