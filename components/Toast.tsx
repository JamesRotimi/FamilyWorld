"use client";

import { useEffect, useState } from "react";

type Props = {
  message: string;
  /** Forces a remount + re-trigger when changed (e.g. timestamp). */
  signal: number | null;
  duration?: number;
};

export default function Toast({ message, signal, duration = 2400 }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (signal == null) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [signal, duration]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed bottom-7 left-1/2 z-40 -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-[13.5px] font-medium text-white shadow-[0_4px_10px_rgba(50,35,20,0.18),0_12px_32px_rgba(50,35,20,0.14)] transition duration-200 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      {message}
    </div>
  );
}
