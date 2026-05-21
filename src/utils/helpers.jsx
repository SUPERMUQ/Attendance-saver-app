import React from 'react';
import { CalendarCheck, Clock, Bell, CheckCircle2 } from 'lucide-react';

export const TIME_SLOTS = [];
for (let h = 8; h <= 18; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}.00`);
  if (h < 18) TIME_SLOTS.push(`${String(h).padStart(2, '0')}.30`);
}

export const validEnd = (s) => {
  const [h, m] = s.split('.').map(Number);
  const mins = h * 60 + m;
  return TIME_SLOTS.filter(t => {
    const [th, tm] = t.split('.').map(Number);
    return th * 60 + tm > mins;
  });
};

export const fmt = (d) => {
  if (!d) return 'TBD';
  return new Date(d).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
};

export const getStatus = (dateStr) => {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  if (diff < 0)  return { label: 'Passed',   bg: '#f1f5f9', color: '#94a3b8', icon: <CheckCircle2 size={10} color="#94a3b8"/> };
  if (diff === 0) return { label: 'Today!',  bg: '#fff7ed', color: '#ea580c', icon: <Bell size={10} color="#ea580c"/> };
  if (diff <= 3)  return { label: 'Soon',    bg: '#fef2f2', color: '#ef4444', icon: <Clock size={10} color="#ef4444"/> };
  return            { label: 'Upcoming', bg: '#f0fdf4', color: '#16a34a', icon: <CalendarCheck size={10} color="#16a34a"/> };
};

export const getDaysLeft = (d) => {
  const diff = Math.ceil((new Date(d) - new Date()) / 86400000);
  if (diff < 0)   return { label: 'Passed',      color: '#94a3b8' };
  if (diff === 0)  return { label: 'Today!',     color: '#ea580c' };
  if (diff <= 7)   return { label: `${diff}d left`, color: '#ef4444' };
  return             { label: `${diff}d left`, color: '#0891b2' };
};
