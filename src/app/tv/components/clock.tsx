'use client';

import { useState, useEffect } from 'react';

export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="font-mono text-5xl font-bold text-foreground">
      {time.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })}
    </div>
  );
}
