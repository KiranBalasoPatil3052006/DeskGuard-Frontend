import { useState, useEffect, useRef, useCallback } from 'react';
import { getSecuritySettings } from '../services/security';

export const useIdleTimeout = (onLogout) => {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(120);
  const [timeoutMinutes, setTimeoutMinutes] = useState(30);

  const lastActivityRef = useRef(Date.now());
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setSecondsRemaining(120);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSecuritySettings();
        if (res?.data?.idle_session_timeout_minutes !== undefined) {
          setTimeoutMinutes(res.data.idle_session_timeout_minutes);
        }
      } catch (err) {
        console.error('Failed to fetch idle timeout settings:', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (timeoutMinutes <= 0) return; // 0 = Never

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleUserActivity = () => {
      if (!showWarning) {
        lastActivityRef.current = Date.now();
      }
    };

    events.forEach((evt) => window.addEventListener(evt, handleUserActivity));

    const checkIntervalMs = 5000;
    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = 2 * 60 * 1000; // Show warning 2 minutes prior

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;

      if (elapsed >= timeoutMs) {
        clearInterval(timerRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
        setShowWarning(false);
        if (onLogout) onLogout();
      } else if (elapsed >= timeoutMs - warningMs && !showWarning) {
        setShowWarning(true);
        const remaining = Math.max(0, Math.floor((timeoutMs - elapsed) / 1000));
        setSecondsRemaining(remaining);
      }
    }, checkIntervalMs);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeoutMinutes, showWarning, onLogout]);

  useEffect(() => {
    if (showWarning) {
      countdownRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            setShowWarning(false);
            if (onLogout) onLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (countdownRef.current) clearInterval(countdownRef.current);
      };
    }
  }, [showWarning, onLogout]);

  return {
    showWarning,
    secondsRemaining,
    resetTimer,
    timeoutMinutes,
  };
};
