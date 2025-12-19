
export const formatTime = (ms: number): string => {
  const date = new Date(ms);
  const now = new Date();
  
  // Calculate if it's today or tomorrow relative to now
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((targetStart - todayStart) / (1000 * 60 * 60 * 24));

  let dayLabel = '';
  if (diffDays === 0) dayLabel = '今日';
  else if (diffDays === 1) dayLabel = '明日';
  else if (diffDays > 1) dayLabel = `${diffDays}天後`;
  else if (diffDays === -1) dayLabel = '昨日';
  else dayLabel = '已過期';

  // Strictly 24-hour format
  const timeStr = date.toLocaleTimeString('zh-TW', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return `${dayLabel} ${timeStr}`;
};

export const formatDuration = (ms: number): string => {
  if (ms < 0) return "00:00:00";
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)));
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const getStatusColors = (status: string) => {
  switch (status) {
    case '準備中': return 'text-amber-400 border-amber-400/50 bg-amber-400/10';
    case '閉城中': return 'text-red-500 border-red-500/50 bg-red-500/10 animate-pulse';
    case '冷卻中': return 'text-blue-400 border-blue-400/50 bg-blue-400/10';
    default: return 'text-emerald-400 border-emerald-400/50 bg-emerald-400/10';
  }
};

export const getLocationColor = (index: number) => {
  const colors = [
    'text-blue-400',
    'text-emerald-400',
    'text-amber-400',
    'text-rose-400',
    'text-purple-400',
    'text-cyan-400',
    'text-pink-400',
    'text-orange-400'
  ];
  return colors[index % colors.length];
};
