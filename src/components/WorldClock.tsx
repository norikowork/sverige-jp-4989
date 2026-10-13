import { useEffect, useState } from 'react';

const formatZoneTime = (date: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value || '';

  return `${get('year')} / ${get('month')} / ${get('day')} ${get('weekday')} ${get('hour')}:${get('minute')}:${get('second')} ${get('dayPeriod')}`;
};

export default function WorldClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col justify-center gap-0.5 text-xs text-gray-600 whitespace-nowrap flex-shrink-0">
      <span>🇸🇪 {formatZoneTime(now, 'Europe/Stockholm')}</span>
      <span>🇯🇵 {formatZoneTime(now, 'Asia/Tokyo')}</span>
    </div>
  );
}
