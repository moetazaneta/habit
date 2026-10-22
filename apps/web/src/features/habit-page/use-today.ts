import { today as todayOf, type Day } from "@habit/core";
import { useEffect, useState } from "react";

/**
 * Today, kept current: it changes at local midnight while the page is open, and when the app comes
 * back to the foreground (a phone throttles timers in the background).
 */
export function useToday(): Day {
  const [day, setDay] = useState(() => todayOf());

  useEffect(() => {
    const refresh = () => setDay(todayOf());
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timer = window.setTimeout(refresh, nextMidnight.getTime() - now.getTime() + 500);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refresh);
    };
  }, [day]);

  return day;
}
