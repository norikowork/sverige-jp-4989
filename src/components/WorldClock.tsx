import { useEffect, useState } from 'react';

const formatZoneTime = (date: Date, timeZone: string) => {
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

interface WorldClockProps {
  className?: string;
}

export default function WorldClock({ className = 'flex' }: WorldClockProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`items-center gap-2 text-sm text-gray-600 whitespace-nowrap ${className}`}>
      <span className="flex items-center gap-1">🇸🇪 スウェーデン {formatZoneTime(now, 'Europe/Stockholm')}</span>
      <span className="text-gray-300">|</span>
      <span className="flex items-center gap-1">🇯🇵 日本 {formatZoneTime(now, 'Asia/Tokyo')}</span>
    </div>
  );
}
